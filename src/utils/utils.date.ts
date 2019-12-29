import {eachDayOfInterval, format, isAfter} from 'date-fns';

export function toDateObj(myDate: any): Date | undefined {
    if (!myDate || myDate === undefined) {
        return undefined;
    }

    if (myDate instanceof String || typeof myDate === 'string') {
        return new Date(`${myDate}`);
    }

    if (typeof myDate === 'number' && !isNaN(myDate)) {
        return new Date(myDate);
    }

    // A Firebase Timestamp format
    if (myDate && myDate.seconds >= 0 && myDate.nanoseconds >= 0) {
        return new Date(myDate.toDate());
    }

    return myDate;
}

export function interval(from: Date | undefined, to: Date | undefined): string[] | undefined {
    if (!from || !to || isAfter(from, to)) {
        return undefined;
    }

    const days: Date[] = eachDayOfInterval({start: from, end: to});
    const results: string[] = days.map((day: Date) => {
        return format(day, 'yyyy-MM-dd');
    });

    return results;
}
