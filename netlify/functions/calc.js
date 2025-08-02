function calculateFVE(consumption, battery, heatpump) {
    const kWhPerKwP = 1050;
    const pricePerKwP = 28000;
    const priceBatteryKWh = 18000;
    const priceHeatpump = 180000;
    const priceElectricity = 6.5;
  
    // Doporučený výkon FVE podle spotřeby
    const fvePower = Math.min(5, Math.ceil(consumption / kWhPerKwP));
    const batterySize = battery === 'ano' ? fvePower : 0;
  
    // Ceny
    const fvePrice = fvePower * pricePerKwP;
    const batteryPrice = batterySize * priceBatteryKWh;
    const heatpumpPrice = heatpump === 'ano' ? priceHeatpump : 0;
  
    // Dotace
    let subsidy = 0;
    subsidy += Math.min(fvePower, 5) * 10000;
    subsidy += batterySize * 10000;
    if (heatpump === 'ano') subsidy += 60000 + 100000;
    else subsidy += 30000;
  
    // Roční úspora
    const yearlySaving = Math.min(fvePower * kWhPerKwP, consumption) * priceElectricity;
  
    // Celková investice
    const totalCost = fvePrice + batteryPrice + heatpumpPrice - subsidy;
    const payback = totalCost / yearlySaving;
  
    return {
      fvePower,
      batterySize,
      totalCost,
      yearlySaving,
      payback,
      subsidy
    };
  }