
import { useState, useEffect } from 'react';
import { Coords } from '../types';

interface GeolocationState {
    loading: boolean;
    error: string | null;
    location: Coords | null;
}

export const useGeolocation = () => {
    const [state, setState] = useState<GeolocationState>({
        loading: true,
        error: null,
        location: null,
    });

    useEffect(() => {
        const onSuccess = (position: GeolocationPosition) => {
            setState({
                loading: false,
                error: null,
                location: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
            });
        };

        const onError = (error: GeolocationPositionError) => {
            setState({
                loading: false,
                error: `Error: ${error.message}`,
                location: null,
            });
        };
        
        if (!navigator.geolocation) {
            setState({
                loading: false,
                error: 'Geolocation is not supported by your browser.',
                location: null,
            });
            return;
        }
        
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
        
    }, []);

    return state;
};
