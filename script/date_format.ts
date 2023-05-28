function getAMPM(d: Date) {
    return d.getHours() / 12 < 1 ? 0 : 1;
}
export function date_format(format_str :string, date = new Date()) {
    const d = typeof date === "object" ? date : new Date(date);
    return format_str.replace(
        /Y|y|n|m|j|d|w|WW|G|g|H|h|AA|I|i|S|s|L|l|A|a|W/g,
        (m: string | undefined) => {
            switch (m) {
                case "Y":
                    return `${d.getFullYear()}`;
                case "y":
                    return `${d.getFullYear()}`.slice(-2);
                case "n":
                    return `${d.getMonth() + 1}`;
                case "m":
                    return `0${d.getMonth() + 1}`.slice(-2);
                case "j":
                    return `${d.getDate()}`;
                case "d":
                    return `0${d.getDate()}`.slice(-2);
                case "w":
                    return `${d.getDay()}`;
                case "WW":
                    return ["日", "月", "火", "水", "木", "金", "土"][
                        d.getDay()
                    ];
                case "W":
                    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                        d.getDay()
                    ];
                case "G":
                    return `${d.getHours()}`;
                case "g":
                    return `${d.getHours() % 12}`;
                case "H":
                    return `0${d.getHours()}`.slice(-2);
                case "h":
                    return `0${d.getHours() % 12}`.slice(-2);
                case "AA":
                    return ["午前", "午後"][getAMPM(d)];
                case "A":
                    return ["AM", "PM"][getAMPM(d)];
                case "a":
                    return ["am", "pm"][getAMPM(d)];
                case "I":
                    return `${d.getMinutes()}`;
                case "i":
                    return `0${d.getMinutes()}`.slice(-2);
                case "S":
                    return `${d.getSeconds()}`;
                case "s":
                    return `0${d.getSeconds()}`.slice(-2);
                case "L":
                    return `${d.getMilliseconds()}`;
                case "l":
                    return `00${d.getMilliseconds()}`.slice(-3);
            }
        }
    );
};
