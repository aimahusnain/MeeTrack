export const formatDate = (date: Date, locale: string = 'en-US'): string => {
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const calculateDaysBetween = (date1: Date, date2: Date): number => {
    const timeDifference = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
};

export const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
};