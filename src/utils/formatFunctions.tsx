// format a number (in seconds) in hours,minutes and seconds 120 => 02:00
export const formatDuration = (duration: number | undefined | string) => {
    if(duration){
      duration = Number(duration);
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
    
      const formattedHours = hours > 0 ? `${hours}:` : '';
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');
    
      return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
    }
};

// format a large number by rounding it to billion, million or thousand, 123000000 => 123M
export function formatNumbers(subs : string | undefined | number) {
    if(subs){
        const subscribers = Number(subs);
        if (subscribers >= 1000000000) {
            return (subscribers / 1000000000).toFixed(2) + 'B';
        } else if (subscribers >= 1000000) {
          return (subscribers / 1000000).toFixed(2) + 'M';
        } else if (subscribers >= 1000) {
          return (subscribers / 1000).toFixed(2) + 'K';
        } else {
          return subscribers.toString();
        }
    }
}

// format a date provided in form of string into readable form
export const formatDate = (dateString: string | undefined) => {
  if(dateString){
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  };

export function formatTimestamp(timestamp: string | undefined) {
    if(timestamp){
      const date = new Date(timestamp)
    
      // Extract the date part
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
      const day = String(date.getDate()).padStart(2, '0')
    
      // Extract the time part
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
    
      // Format the date and time
      const formattedDate = `${year}-${month}-${day}`
      const formattedTime = `${hours}:${minutes}`
    
      return `${formattedDate} | ${formattedTime} UTC`
    }
  }

  // add commas to a number to represent it in international format, 123000000 => 123,000,000
export function formatNumberWithCommas(number : number | string | undefined) {
  if(number)
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}