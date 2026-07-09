import yfinance as yf
import pandas as pd
from logger import log


def download_stock_history(
    stock_id: str,
    market: str,
    period: str = "max",
    interval: str = "1d",
) -> pd.DataFrame:
    """
    下載股票歷史資料（日K）
    再自行轉換成週K
    """

    if market == "上市":
        symbol = f"{stock_id}.TW"
    elif market == "上櫃":
        symbol = f"{stock_id}.TWO"
    else:
        raise Exception(f"未知市場：{market}")

    log(f"下載 {symbol} ({interval})")

    df = yf.download(
        symbol,
        period=period,
        interval=interval,
        auto_adjust=False,
        progress=False,
    )

    if df.empty:
        raise Exception(f"{stock_id} ({market}) 無資料")

    df.reset_index(inplace=True)

    # yfinance 新版可能回傳 MultiIndex 欄位
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[0] for col in df.columns]

    # 日期欄轉 datetime
    df["Date"] = pd.to_datetime(df["Date"])
    df.set_index("Date", inplace=True)

    # 轉成週K（以星期五為每週結束）
    weekly = df.resample("W-FRI").agg({
        "Open": "first",
        "High": "max",
        "Low": "min",
        "Close": "last",
        "Volume": "sum",
    })

    # 移除沒有交易的週
    weekly = weekly.dropna()

    weekly.reset_index(inplace=True)

    return weekly