export function regExpFromString(regex: string): RegExp {
    const delimiterPosition = regex.lastIndexOf('/');
    if (delimiterPosition == -1) return new RegExp(regex);

    const pattern = regex.substring(1, delimiterPosition);
    let flags = regex.substring(delimiterPosition + 1);
    return new RegExp(pattern, flags);
}
