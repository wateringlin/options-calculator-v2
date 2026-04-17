//@version=5
import TradingView/ta/8

// 富途 VXM：每张单边佣金（美元）；与 MARGIN 一起在实盘以 APP 为准
FUTU_VXM_COMMISSION_PER_CONTRACT = 4.0

// —— VXM + 富途保证金模型（仅回测近似；与实盘略有偏差）——
// · 初始本金 10 万；每张初始保证金 1300 USD（富途，可改 MARGIN_PER_CONTRACT）
// · 「分 10 份」= 每一笔**新开/加仓**的保证金预算 = **当前 strategy.equity 的 10%**（会随盈亏变）
// · 总占用保证金 ≤ **当前权益 × MAX_MARGIN_USAGE**（默认 75%，可改 0.70~0.80）
// · 加码层数：首单 + 9 次加仓 = 最多 10 笔（pyramiding=9）
// · 佣金：cash_per_contract = FUTU_VXM_COMMISSION_PER_CONTRACT；每次**成交**计费，开、平各一次 ⇒ 约 2×/张/完整一轮
// · 不使用策略属性面板里的订单大小与佣金；均以代码为准
strategy(
     "vxm期货-日线-多空均做-+spx-trend-1分线",
     overlay               = false,
     initial_capital       = 100000,
     currency              = currency.USD,
     commission_type       = strategy.commission.cash_per_contract,
     commission_value      = FUTU_VXM_COMMISSION_PER_CONTRACT,
     default_qty_type      = strategy.fixed,
     default_qty_value     = 1,
     pyramiding            = 9)

// 富途 VXM 参考：每张初始保证金（美元）；以你 APP 实时为准
MARGIN_PER_CONTRACT = 1300.0

// —— 多头 / 空头 分开设「单笔保证金预算比例」与「总占用上限」——
// 空头：VIX 急涨时空 VXM 亏损加速，20 年回测易「爆仓」→ 空头宜明显更保守（仍穿仓则再降或减 pyramiding）。
// 经验起点：多头 单笔 10% / 总占用 ≤60%；空头 单笔 4~6% / 总占用 ≤25~35%。以下为偏稳健默认。
SLICE_EQUITY_PCT_LONG  = 10.0
MAX_MARGIN_USAGE_LONG  = 0.7
SLICE_EQUITY_PCT_SHORT = 3.0
MAX_MARGIN_USAGE_SHORT = 0.1

// 当前持仓估算占用保证金（张数 × 每张；多空绝对值）
current_margin_used() =>
    math.abs(strategy.position_size) * MARGIN_PER_CONTRACT

// direction: strategy.long → 用多头参数；strategy.short → 用空头参数（更严）
entry_qty_vxm(isLong) =>
    float eq = strategy.equity
    if eq <= 0 or MARGIN_PER_CONTRACT <= 0
        0
    float slicePct = isLong ? SLICE_EQUITY_PCT_LONG : SLICE_EQUITY_PCT_SHORT
    float maxUse   = isLong ? MAX_MARGIN_USAGE_LONG : MAX_MARGIN_USAGE_SHORT
    float budget_slice      = eq * (slicePct / 100.0)
    float want_contracts    = math.floor(budget_slice / MARGIN_PER_CONTRACT)
    float max_margin_budget = eq * maxUse
    float used              = current_margin_used()
    float margin_remain     = max_margin_budget - used
    float cap_by_total      = margin_remain > 0 ? math.floor(margin_remain / MARGIN_PER_CONTRACT) : 0
    float q                 = math.min(want_contracts, cap_by_total)
    math.max(0, q)

// 周线
getTrendLine() =>
    weekllvLow = ta.lowest(low, 18)
    weekhhvHigh = ta.highest(high, 18)
    weekvalue = (close - weekllvLow) / (weekhhvHigh - weekllvLow) * 100
    weeksma1 = ta.sma(weekvalue, 5)
    weeksma2 = ta.sma(weeksma1, 3)
    3 * weeksma1 - 2 * weeksma2
weekTrendLine = request.security('CBOE:VIX', "W", getTrendLine(), barmerge.gaps_off, barmerge.lookahead_off)
plot(weekTrendLine, title="weekTrendLine", color=color.yellow, linewidth=2)
weekClose = request.security('CBOE:VIX', "W", close, barmerge.gaps_off, barmerge.lookahead_off)

// 周线信号
weekbuySignal = weekTrendLine<=5 and weekClose < 20
weekcloseBuySignal = weekTrendLine >= 50 
plotshape(weekbuySignal ? weekTrendLine : na, '买点', shape.triangleup, location.absolute, color.rgb(247, 188, 188), size = size.tiny)
plotshape(weekcloseBuySignal ? weekTrendLine : na, '卖点', shape.triangledown, location.absolute, color.rgb(185, 255, 188), size = size.tiny)

var bool inWeekBuyZone = false
if weekbuySignal
    inWeekBuyZone := true
if weekcloseBuySignal
    inWeekBuyZone := false

getDayTrendLine() =>
    dayllvLow = ta.lowest(low, 20)
    dayhhvHigh = ta.highest(high, 20)
    dayvalue = (close - dayllvLow) / (dayhhvHigh - dayllvLow) * 100
    daysma1 = ta.sma(dayvalue, 5)
    daysma2 = ta.sma(daysma1, 3)
    3 * daysma1 - 2 * daysma2
dayTrendLine = request.security('CBOE:VIX', "D", getDayTrendLine(), barmerge.gaps_off, barmerge.lookahead_off)
dayClose = request.security('CBOE:VIX', "D", close, barmerge.gaps_off, barmerge.lookahead_off)
plot(dayTrendLine, title="dayTrendLine", color=color.blue, linewidth=2)

maClose = ta.sma(close, 5)

var2q = low[1]
var3q = ta.sma(math.abs(low - var2q), 3) / ta.sma(math.max(low - var2q, 0), 3) * 100
var4q = ta.ema(close * 1.3 > 0 ? var3q * 10 : var3q / 10, 3)
var5q = ta.lowest(low, 30)
var6q = ta.highest(var4q, 30)
var7q = ta.sma(close, 58) > 0 ? 1 : 0
var8q = ta.ema(low <= var5q ? (var4q + var6q * 2) / 2 : 0, 3) / 999 * var7q
flame_mountain = var8q > 100 ? 100 : var8q
rising_flame = flame_mountain > 5 and flame_mountain > flame_mountain[1]

var2t = high[1]
var3t = ta.sma(math.abs(high - var2t), 3) / ta.sma(math.max(high - var2t, 0), 3) * 100
var4t = ta.ema(close * 1.3 > 0 ? var3t * 10 : var3t / 10, 3)
var5t = ta.highest(high, 30)
var6t = ta.highest(var4t, 30)
var8t = ta.ema(high >= var5t ? (var4t + var6t * 2) / 2 : 0, 3) / 999 * var7q
flame_mountain_top = var8t > 100 ? 100 : var8t
rising_peak = flame_mountain_top > 5 and flame_mountain_top > flame_mountain_top[1]

plot(rising_flame ? flame_mountain * 1.2 : na, style=plot.style_columns, color=color.new(#4444FF, 0), title="Flame Mountain Strong", linewidth = 4)
plot(rising_flame ? flame_mountain * 1.2 : na, style=plot.style_columns, color=color.new(#5555FF, 30), title="Flame Mountain Medium", linewidth = 4)
plot(rising_flame ? flame_mountain * 1.2 : na, style=plot.style_columns, color=color.new(#7777FF, 50), title="Flame Mountain Light", linewidth = 4)
plot(rising_flame ? flame_mountain * 1.2 : na, style=plot.style_columns, color=color.new(#9999FF, 70), title="Flame Mountain Faint", linewidth = 4)

plot(rising_peak ? flame_mountain_top * 1.2 : na, style=plot.style_columns, color=color.new(#FF6644, 0), title="Peak Flame Strong", linewidth = 4)
plot(rising_peak ? flame_mountain_top * 1.2 : na, style=plot.style_columns, color=color.new(#FF7744, 30), title="Peak Flame Medium", linewidth = 4)
plot(rising_peak ? flame_mountain_top * 1.2 : na, style=plot.style_columns, color=color.new(#FF8844, 50), title="Peak Flame Light", linewidth = 4)
plot(rising_peak ? flame_mountain_top * 1.2 : na, style=plot.style_columns, color=color.new(#FF9944, 70), title="Peak Flame Faint", linewidth = 4)

buySignal = (dayTrendLine<=10 and  dayClose<18 and weekTrendLine <= 40) or (weekbuySignal and dayTrendLine<=40 and dayClose<18) or (dayTrendLine<=5 and dayClose < 18)
closeBuySignal = dayTrendLine >= 50 and dayClose[0] > dayClose[1] and dayClose >20
plotshape(buySignal ? dayTrendLine : na, '买点', shape.triangleup, location.absolute, color.red, size = size.tiny)
plotshape(closeBuySignal ? dayTrendLine : na, '卖点', shape.triangledown, location.absolute, color.green, size = size.tiny)

longQty  = entry_qty_vxm(true)
shortQty = entry_qty_vxm(false)

if (buySignal or (rising_flame and weekTrendLine < 30))
    strategy.close("sell", '平仓')
if (buySignal or (rising_flame and weekTrendLine < 30)) and longQty >= 1
    strategy.entry("buy", strategy.long, qty = longQty)

if (closeBuySignal or (rising_peak))
    strategy.close('buy', '平仓')
if (closeBuySignal or (rising_peak)) and shortQty >= 1
    strategy.entry('sell', strategy.short, qty = shortQty)

// 夏普（报表内可看数值；以下为经验区间）
// <0：差 | 0~0.5：一般 | 0.5~1：尚可 | 1~2：偏高风险高收益 | >2：样本内极好，需警惕过拟合
