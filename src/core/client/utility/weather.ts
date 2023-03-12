import * as alt from 'alt-client';
import * as native from 'natives';
import { SYSTEM_EVENTS } from '@AthenaShared/enums/system';

let isTransitioning = false;
let prevWeather = 'Clear';

export function isChanging(): boolean {
    return isTransitioning;
}

export async function changeTo(nextWeather: string, timeInSeconds: number) {
    if (timeInSeconds > 60) {
        timeInSeconds = 60;
    }

    const timeInMs = timeInSeconds * 1000;
    await alt.Utils.waitFor(() => isTransitioning === false, timeInMs);

    isTransitioning = true;

    native.clearOverrideWeather();
    native.clearWeatherTypePersist();
    native.setWeatherTypeOvertimePersist(nextWeather, timeInSeconds);
    native.setWeatherTypePersist(nextWeather);

    prevWeather = nextWeather;

    alt.setTimeout(() => {
        native.setWeatherTypeNow(nextWeather);
        native.setWeatherTypeNowPersist(nextWeather);
        isTransitioning = false;
    }, timeInMs - 500);
}

alt.onServer(SYSTEM_EVENTS.WEATHER_CHANGE_TO, changeTo);
