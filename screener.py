import pandas as pd


def check_strategy(df: pd.DataFrame):

    # 至少需要35根週K，避免MACD因歷史資料不足而不穩定
    if len(df) < 35:
        return None

    # 本週
    this_week = df.iloc[-1]

    # 上週
    last_week = df.iloc[-2]

    close_this_week = float(this_week["Close"])
    high_last_week = float(last_week["High"])

    osc_this_week = float(this_week["OSC"])
    osc_last_week = float(last_week["OSC"])

    # 條件一：本週收盤 > 上週最高（包含上影線）
    condition1 = close_this_week > high_last_week

    # 條件二：OSC不得轉弱
    if osc_this_week >= 0:
        # 正值必須持續放大
        condition2 = osc_this_week >= osc_last_week
    else:
        # 負值必須向0軸收斂
        condition2 = abs(osc_this_week) <= abs(osc_last_week)

    return {
        "close": round(close_this_week, 2),
        "high": round(high_last_week, 2),

        "osc": round(osc_this_week, 4),
        "osc_prev": round(osc_last_week, 4),

        "condition1": condition1,
        "condition2": condition2,

        "pass": condition1 and condition2,
    }