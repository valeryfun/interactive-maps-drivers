import './App.css'
import React, { useState, useCallback, useRef } from 'react'
import {
	GoogleMap,
	useLoadScript,
	Marker,
	InfoWindow
} from '@react-google-maps/api'
import usePlacesAutocomplete, {
	getGeocode,
	getLatLng
} from 'use-places-autocomplete'
import { formatRelative } from 'date-fns'
import mapStyles from './mapStyles'

const libraries = ['places']
const mapContainerStyle = {
	width: '100vw',
	height: '100vh'
}
const center = {
	lat: 1.285194,
	lng: 103.8522982
}

const options = {
	styles: mapStyles,
	disableDefaultUI: true,
	zoomControl: true
}

export default function App() {
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
		libraries
	})

	const [markers, setMarkers] = useState([])
	const [selected, setSelected] = useState(null)

	const onMapClick = useCallback(e => {
		setMarkers(current => [
			...current,
			{ lat: e.latLng.lat(), lng: e.latLng.lng(), time: new Date() }
		])
	}, [])

	const mapRef = useRef()
	const onMapLoad = useCallback(map => {
		mapRef.current = map
	}, [])

	const panTo = useCallback(({ lat, lng }) => {
		mapRef.current.panTo({ lat, lng })
		mapRef.current.setZoom(15)
	}, [])

	if (loadError) return 'Error loading maps'
	if (!isLoaded) return 'Loading Maps'

	return (
		<div>
			<GoogleMap
				mapContainerStyle={mapContainerStyle}
				zoom={12}
				center={center}
				options={options}
				onClick={onMapClick}
				onLoad={onMapLoad}
			>
				{markers.map(marker => (
					<Marker
						key={marker.time.toISOString()}
						position={{ lat: marker.lat, lng: marker.lng }}
						onClick={e => {
							setSelected(marker)
						}}
					/>
				))}

				{selected ? (
					<InfoWindow
						position={{ lat: selected.lat, lng: selected.lng }}
						onCloseClick={() => {
							setSelected(null)
						}}
					>
						<div>
							<h2>Number of Taxis: </h2>
							<p>{formatRelative(selected.time, new Date())}</p>
						</div>
					</InfoWindow>
				) : null}
			</GoogleMap>
		</div>
	)
}
