import {FC} from "react";
import GoogleMapReact from 'google-map-react';
type Props = {
    lat:number,
lng:number,
text:string
}
const AnyReactComponent:FC<Props> = ({text=""  }) => <div>{text}</div>;

const GoogleMapLocation:FC = ({}) => {
    const defaultProps = {
        center: {
            lat: 10.99835602,
            lng: 77.01502627
        },
        zoom: 11
    };

    return (
        // Important! Always set the container height explicitly
        <div style={{ height: '18rem', width: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: "" }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
            >
                <AnyReactComponent
                    lat={59.955413}
                    lng={30.337844}
                    text="My Marker"
                />
            </GoogleMapReact>
        </div>
    );
}
export {GoogleMapLocation}