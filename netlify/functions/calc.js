const calc = {
    fvePricePerKwp: 28000,
    batteryPricePerKwh: 18000,
    tcPrice: 180000,
    electricityPrice: 6.5,
  
    compute({ consumption, battery, tc }) {
      const kwpNeeded = Math.min(Math.ceil(consumption / 1050), 10);
      const batterySize = battery ? kwpNeeded : 0;
  
      const fveCost = kwpNeeded * this.fvePricePerKwp;
      const batteryCost = batterySize * this.batteryPricePerKwh;
      const tcCost = tc ? this.tcPrice : 0;
  
      const fveSubsidy = Math.min(kwpNeeded, 5) * 10000;
      const batterySubsidy = battery ? batterySize * 10000 : 0;
      const bonus = tc ? 60000 : 30000;
  
      const totalSubsidy = fveSubsidy + batterySubsidy + bonus + (tc ? 100000 : 0);
      const totalCost = fveCost + batteryCost + tcCost - totalSubsidy;
  
      const yearlySaving = Math.min(consumption, kwpNeeded * 1050) * this.electricityPrice;
      const returnYears = Math.max(1, (totalCost / yearlySaving).toFixed(1));
  
      return { kwpNeeded, batterySize, fveCost, batteryCost, tcCost, totalSubsidy, totalCost, yearlySaving, returnYears };
    },
  
    exportCSV() {
      return "Sloupec;Hodnota\nFVE výkon;kWp\nRoční úspora;Kč\nNávratnost;Roky";
    }
  };