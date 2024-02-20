  export function formatDuration(days:number) {
      if (days < 0) {
        return "Invalid duration";
      }
    
      if (days === 1) {
        return "1 Day";
      }
    
      if (days < 7) {
        return days + " Days";
      }
    
      if (days < 30) {
        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;
        if (remainingDays === 0) {
          return weeks + " Weeks";
        } else {
          return weeks + " Weeks";
        }
      }
    
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (remainingDays === 0) {
        return months + " months";
      } else if (remainingDays < 7) {
        return months + " Months";
      } else {
        const weeks = Math.floor(remainingDays / 7);
        const daysLeft = remainingDays % 7;
        if (daysLeft === 0) {
          return months + " Months";
        } else {
          return months + " Months";
        }
      }
    }