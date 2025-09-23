
  

  // const groupDoctorsByPaymentStatus = () => {
  //   const groupedData: any = {
  //     greenTable: [],
  //     yellowTable: [],
  //     redTable: [],
  //   };
  
  //   payments.forEach((payment: PaymentInterface) => {
  //     const missedYears = Years.filter((year) => {
  //       const hasPayment = payment.subscriptionYear === year;
  //       const isBeforeInscription = new Date(payment.doctor.inscriptionDate).getFullYear() > Number(year);
  
  //       return !hasPayment && !isBeforeInscription;
  //     });
  
  //     const hasPaymentThisYear = missedYears.length === 0;
  
  //     if (hasPaymentThisYear) {
  //       if (
  //         !groupedData.yellowTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo) &&
  //         !groupedData.redTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo)
  //       ) {
  //         groupedData.greenTable.push(payment);
  //       }
  //     } else if (missedYears.length <= 2 || payment.amount === 0) {
  //       // Check if the doctor has payments for all years except the missed years
  //       const allYearsExceptMissed = Years.filter(year => !missedYears.includes(year));
  //       const hasPaymentsForAllYearsExceptMissed = allYearsExceptMissed.every(year =>
  //         payments.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo && paym.subscriptionYear === year)
  //       );
  
  //       if (
  //         !groupedData.greenTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo) &&
  //         !groupedData.redTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo) &&
  //         !hasPaymentsForAllYearsExceptMissed
  //       ) {
  //         groupedData.yellowTable.push(payment);
  //       }
  //     } else if (missedYears.length > 2 && payment.amount > 0) {
  //       if (
  //         !groupedData.greenTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo) &&
  //         !groupedData.yellowTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo)
  //       ) {
  //         groupedData.redTable.push(payment);
  //       }
  //     }
  //   });
  
  //   return groupedData;
  // };
  



  // const groupDoctorsByPaymentStatus = () => {
  //   const groupedData: any = {
  //     greenTable: [],
  //     yellowTable: [],
  //     redTable: [],
  //   };
  
  //   payments.forEach((payment: PaymentInterface) => {
      
  //     const missedYears = Years.filter((year) => {
  //       const hasPayment = payment.subscriptionYear === year;
  //       const isBeforeInscription = new Date(payment.doctor.inscriptionDate).getFullYear() > Number(year);
  
  //       return !hasPayment && !isBeforeInscription;
  //     });
  
  //     // Check if the doctor has a payment in the current year
  //     const hasPaymentThisYear = missedYears.length === 0;
  
  //     if (hasPaymentThisYear) {
  //       if (
  //         !groupedData.yellowTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo) &&
  //         !groupedData.redTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo)
  //       ) {
  //         groupedData.greenTable.push(payment);
  //       }
  //     } else if (missedYears.length <= 2) {
  //       if (
  //         !groupedData.greenTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo) &&
  //         !groupedData.redTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo)
  //       ) {
  //         groupedData.yellowTable.push(payment);
  //       }
  //     } else if (missedYears.length > 2) {
  //       if (
  //         !groupedData.greenTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo) &&
  //         !groupedData.yellowTable.some((paym: PaymentInterface) => paym.doctor.RegNo === payment.doctor.RegNo)
  //       ) {
  //         groupedData.redTable.push(payment);
  //       }
  //     }
  //   });

  //   return groupedData;
  // };  