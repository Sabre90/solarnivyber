function calculateFVE({ spotreba, baterie, tepelneCerpadlo }) {
    const kWpNeeded = Math.ceil(spotreba / 1050);
    const fvePrice = kWpNeeded * 28000;
    const batterySize = baterie ? kWpNeeded : 0;
    const batteryPrice = batterySize * 18000;
    const tcoPrice = tepelneCerpadlo ? 180000 : 0;
  
    let subsidy = 0;
    subsidy += Math.min(kWpNeeded, 5) * 10000;
    if (batterySize > 0) subsidy += batterySize * 10000;
    if (tepelneCerpadlo) subsidy += 60000 + 100000;
  
    const totalInvestment = fvePrice + batteryPrice + tcoPrice - subsidy;
    const annualSaving = Math.min(spotreba, kWpNeeded * 1050) * 6.5;
    const payback = Math.round(totalInvestment / annualSaving);
  
    return {
      kWpNeeded,
      batterySize,
      fvePrice,
      batteryPrice,
      tcoPrice,
      subsidy,
      totalInvestment,
      annualSaving,
      payback
    };
  }