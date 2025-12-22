import ms from "ms";

/**
 * an abstraction over `ms`, returns seconds instead of milliseconds
 *
 * @param value - A duration string (e.g. "1s", "5m", "2h")
 * @returns the duration in seconds
 */
function secs(value: ms.StringValue): number {
    return ms(value) / 1000;
}

export default secs;
