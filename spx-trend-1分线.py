//@version=6
strategy('spx-trend-1分线', overlay = false, initial_capital = 200000, default_qty_type = strategy.percent_of_equity, default_qty_value = 1, commission_value = 1, currency = currency.USD)
// strategy('vix-trend-3分线', overlay = false, initial_capital = 5000, default_qty_type = strategy.fixed, default_qty_value = close, commission_value = 10, currency = currency.USD)
import TradingView/ta/8

// 5分钟 计算 LLV 和 HHV
llvLow = ta.lowest(low, 27) // 最低低价
hhvHigh = ta.highest(high, 27) // 最高高价
// 核心计算：(CLOSE - LLV(LOW, 27)) / (HHV(HIGH, 27) - LLV(LOW, 27)) * 100
value = (close - llvLow) / (hhvHigh - llvLow) * 100
// 第一层 SMA：3 * SMA(value, 5, 1)
sma1 = ta.sma(value, 5)
// 第二层 SMA：SMA(SMA(value, 5, 1), 3, 1)
sma2 = ta.sma(sma1, 3)
// 趋势线公式：3 * sma1 - 2 * sma2
trendLine = 3 * sma1 - 2 * sma2
// 5分钟线
plot(trendLine, title = 'trendLine', color = color.blue, linewidth = 2)

// 5分钟 计算 LLV 和 HHV
llvLow2 = ta.lowest(low, 200) // 最低低价
hhvHigh2 = ta.highest(high, 200) // 最高高价
// 核心计算：(CLOSE - LLV(LOW, 27)) / (HHV(HIGH, 27) - LLV(LOW, 27)) * 100
value2 = (close - llvLow2) / (hhvHigh2 - llvLow2) * 100
// 第一层 SMA：3 * SMA(value, 5, 1)
sma12 = ta.sma(value2, 5)
// 第二层 SMA：SMA(SMA(value, 5, 1), 3, 1)
sma22 = ta.sma(sma12, 3)
// 趋势线公式：3 * sma1 - 2 * sma2
trendLine2 = 3 * sma12 - 2 * sma22
// 5分钟线
// plot(trendLine2, title = 'trendLine', color = color.orange, linewidth = 2)

// 日 计算 LLV 和 HHV
llvLow3 = ta.lowest(low, 1380) // 最低低价 3888 7776
hhvHigh3 = ta.highest(high, 1380) // 最高高价
// 核心计算：(CLOSE - LLV(LOW, 27)) / (HHV(HIGH, 27) - LLV(LOW, 27)) * 100
value3 = (close - llvLow3) / (hhvHigh3 - llvLow3) * 100
// 第一层 SMA：3 * SMA(value, 5, 1)
sma13 = ta.sma(value3, 5)
// 第二层 SMA：SMA(SMA(value, 5, 1), 3, 1)
sma23 = ta.sma(sma13, 3)
// 趋势线公式：3 * sma1 - 2 * sma2
dayTrendLine3 = 3 * sma13 - 2 * sma23
// plot(dayTrendLine3, title = 'trendLine', color = color.red, linewidth = 2)

// 使用varip确保变量在实时栏中保持持久性
// varip float cumulativePriceVolume = na
// varip float cumulativeVolume = na

// 计算VWAP
// vwapValue = ta.vwap(close)
// // 绘制VWAP线
// plot(vwapValue, title="VWAP", color=color.blue, linewidth=2)


// 定义交易时间段
is_trading_time = false
// 获取当前时间的小时和分钟
hour1 = hour(time, 'GMT+8') // 使用 GMT+8 时间（根据需要调整时区）
minute1 = minute(time, 'GMT+8')
// 判断是否在交易时间段内，股票才限制这个时间
// if (hour1 == 18 and minute1 >= 30) // 晚上 9:30 开始
//     is_trading_time := true
// else 
if hour1 >= 22 or hour1 < 5 // 下午4点 到凌晨 2:00
    is_trading_time := true

// 昨天
yesterdayTrendLine3 = dayTrendLine3[156] //156 312
// plot(yesterdayTrendLine3, title = 'Yesterday\'s Close', color = color.gray, linewidth = 2)

// 3天前
weekAgoTrendLine3 = dayTrendLine3[936] // 468 936
// plot(weekAgoTrendLine3, title = 'Yesterday\'s Close', color = color.yellow, linewidth = 2)

// 3天前的3天前
weekweekAgoTrendLine3 = weekAgoTrendLine3[468] // 468
// plot(weekweekAgoTrendLine3, title = 'Yesterday\'s Close', color = color.green, linewidth = 2)

// 做多信号
// buyCondition0 = trendLine3[10] >= weekAgoTrendLine3[10] and trendLine3[10] <= yesterdayTrendLine3[10] and trendLine3[20] >= weekAgoTrendLine3[20] and trendLine3[20] <= yesterdayTrendLine3[20] and trendLine3[30] >= weekAgoTrendLine3[30] and trendLine3[30] <= yesterdayTrendLine3[30] and trendLine3[40] >= weekAgoTrendLine3[40] and trendLine3[40] <= yesterdayTrendLine3[40] //and weekAgoTrendLine3[20] >= weekweekAgoTrendLine3[20] and weekAgoTrendLine3[40] >= weekweekAgoTrendLine3[40]
// buyCondition0 = trendLine3[10] <= yesterdayTrendLine3[10] and trendLine3[20] <= yesterdayTrendLine3[20] and trendLine3[30] <= yesterdayTrendLine3[30] and trendLine3[40] <= yesterdayTrendLine3[40] //and weekAgoTrendLine3[20] >= weekweekAgoTrendLine3[20] and weekAgoTrendLine3[40] >= weekweekAgoTrendLine3[40]
// buyCondition1 = trendLine <= 10 and trendLine3 >= weekweekAgoTrendLine3 and trendLine3 <= yesterdayTrendLine3 and weekweekAgoTrendLine3 <= 50 and weekAgoTrendLine3 >= weekweekAgoTrendLine3
// buyCondition1 = trendLine <= 0 and trendLine3 <= yesterdayTrendLine3 and yesterdayTrendLine3 <= weekAgoTrendLine3
// buyCondition2 = trendLine <= 10 and trendLine3 <= 20
// buyCondition3 = trendLine <= 10 and trendLine3 <= 20 and yesterdayTrendLine3 <= 20 and weekweekAgoTrendLine3 <= 20
// buySignal = (((buyCondition0 and buyCondition1) or buyCondition2 or buyCondition3) and close <= 22) or buyCondition4
// buySignal = ((buyCondition0 and buyCondition1) or buyCondition2 or buyCondition3) 
// buySignal = (buyCondition0 and buyCondition1)
// var float preDayTendlinne3 = na
// buyCondition0 = trendLine3[10]<yesterdayTrendLine3[10] and trendLine3[20]<yesterdayTrendLine3[20]
// buyCondition1 = trendLine3[1]<yesterdayTrendLine3 and trendLine3>=yesterdayTrendLine3 and trendLine3>=weekweekAgoTrendLine3 and trendLine3>=weekAgoTrendLine3
// buyCondition1 = trendLine<=10 and trendLine3>=50 and trendLine3>=yesterdayTrendLine3 and trendLine3>=weekweekAgoTrendLine3 and trendLine3>=weekAgoTrendLine3
// buyCondition1 = trendLine<=0 and dayTrendLine3>=weekAgoTrendLine3 and dayTrendLine3>=weekweekAgoTrendLine3

// Variable calculations
var2q = low[1]
var3q = ta.sma(math.abs(low - var2q), 3) / ta.sma(math.max(low - var2q, 0), 3) * 100
var4q = ta.ema(close * 1.3 > 0 ? var3q * 10 : var3q / 10, 3)
var5q = ta.lowest(low, 30)
var6q = ta.highest(var4q, 30)
var7q = ta.sma(close, 58) > 0 ? 1 : 0
var8q = ta.ema(low <= var5q ? (var4q + var6q * 2) / 2 : 0, 3) / 999 * var7q
// Flame Mountain calculation
flame_mountain = var8q > 100 ? 100 : var8q
// Plotting
rising_flame = flame_mountain > 0 and flame_mountain > flame_mountain[1]
plot(rising_flame ? flame_mountain * 1.2 : na, style=plot.style_columns, color=color.new(#4444FF, 0), title="Flame Mountain Strong", linewidth = 4)
plot(rising_flame ? flame_mountain * 1.2 : na, style=plot.style_columns, color=color.new(#5555FF, 30), title="Flame Mountain Medium", linewidth = 4)
plot(rising_flame ? flame_mountain * 1.2 : na, style=plot.style_columns, color=color.new(#7777FF, 50), title="Flame Mountain Light", linewidth = 4)
plot(rising_flame ? flame_mountain * 1.2 : na, style=plot.style_columns, color=color.new(#9999FF, 70), title="Flame Mountain Faint", linewidth = 4)


// 计算33周期最低价
var2 = ta.lowest(low, 33)
// 计算21周期最高价
var3 = ta.highest(high, 21)
// 计算归一化的EMA指标
var4 = ta.ema((close - var2) / (var3 - var2) * 100, 10) * -1 + 100
// 计算安全线（双重平滑处理）
ref_var4 = var4[1]
safety_line = 100 - ta.ema(0.191 * ref_var4 + 0.809 * var4, 1)
// 绘制安全线（蓝色粗线）
// plot(safety_line, "安全线", 
//      color=color.white, 
//      linewidth=2, 
//      style=plot.style_line)


buyCondition1 = rising_flame // and trendLine<=40 and dayTrendLine3>=yesterdayTrendLine3
buySignal = buyCondition1 and is_trading_time
closeCondition1 = trendLine>=80
closeBuySignal = closeCondition1 and is_trading_time


// sellCondition1 = trendLine>= 100 and yesterdayTrendLine3>=dayTrendLine3
// sellSignal = sellCondition1 //and is_trading_time
// closeSellCondition1 = trendLine<=0
// closeSellSignal = closeSellCondition1 //and is_trading_time


if buySignal
    strategy.entry('buy', strategy.long)
if closeBuySignal
    strategy.close('buy', '平仓')

// if (sellSignal)
//     strategy.entry("sell", strategy.short)
// if (closeSellSignal)
//     strategy.close("sell", '卖出平仓')

// 检查是否有持仓
// hasPosition = strategy.position_size != 0
// if hour1 == 5 and hasPosition
//     strategy.close_all(comment="Night Close")











// // 做空信号
// // sellCondition1 = trendLine >= 90 and trendLine3 <= weekAgoTrendLine3 and trendLine3 >= yesterdayTrendLine3 and weekAgoTrendLine3 >= 60 and yesterdayTrendLine3 >= 60 //and weekAgoTrendLine3 <= weekweekAgoTrendLine3
// // sellCondition2 = trendLine >= 90 and trendLine3>=70
// sellCondition3 = (trendLine3-trendLine3[10])>= 10 // and  trendLine3>=50 and trendLine3 <= weekAgoTrendLine3
// // sellCondition4 = trendLine >= 90 and trendLine3 <= weekAgoTrendLine3 and trendLine3 >= 40 and trendLine3 >= yesterdayTrendLine3
// sellSignal =  sellCondition3 and is_trading_time
// // closeSellCondition1 = trendLine <= 60 and trendLine3<=60 and trendLine3 <= weekAgoTrendLine3 and trendLine3 <= yesterdayTrendLine3 and is_trading_time
// closeSellCondition2 = (trendLine3[10] - trendLine3)>=10 and trendLine3<=50
// // closeSellCondition4 = trendLine <= 10 and ((trendLine3[10] - trendLine3)>=10 or trendLine3<=30) // and trendLine3 <= weekAgoTrendLine3 and trendLine3 <= yesterdayTrendLine3
// closeSellSignal = closeSellCondition2 and is_trading_time


// alertcondition(buySignalVol, title="买入信号", message="买入")
// alertcondition(closeBuySignalVol, title="平仓信号", message="平仓")


// stopLongLossPct = input(30.0, "止损百分比") / 100
// stopShortLossPct = input(20.0, "止损百分比") / 100
// takeProfitPct = input(30.0, "盈百分比") / 100

// if buySignal
//     strategy.entry('buy', strategy.long)
//     // strategy.exit("止损平仓", "buy", stop=strategy.position_avg_price * (1 - stopLongLossPct))
// if closeBuySignal
//     strategy.close('buy', '买入平仓')

// if (sellSignal)
//     strategy.entry("sell", strategy.short)
// //     // strategy.exit("止损平仓", "buy", stop=strategy.position_avg_price * (1 - stopLossPct), limit=strategy.position_avg_price * (1 + takeProfitPct))
// //     // strategy.exit("止损平仓", "buy", stop=strategy.position_avg_price * (1 - stopLossPct), trail_points=close * 0.05,trail_offset=close * 0.03)  // 5%移动止损
// //     strategy.exit("止损平仓", "sell", stop=strategy.position_avg_price * (1 + stopShortLossPct))
// if (closeSellSignal)
//     strategy.close("sell", '卖出平仓')

// // 检查是否有持仓
// hasPosition = strategy.position_size != 0
// if hour1 == 2 and hasPosition
//     strategy.close_all(comment="Night Close")
