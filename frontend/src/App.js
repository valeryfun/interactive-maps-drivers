import './App.css'
import React, { useState, useCallback, useRef, useEffect } from 'react'
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
import {
	Combobox,
	ComboboxInput,
	ComboboxPopover,
	ComboboxList,
	ComboboxOption
} from '@reach/combobox'
import '@reach/combobox/styles.css'
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
	const [isLoading, setIsLoading] = useState(false)
	const [drivers, setDrivers] = useState([])
	const [error, setError] = useState(null)

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

	// useEffect(() => {
	// 	var xhr = new XMLHttpRequest()
	// 	xhr.addEventListener('readtstatechange', () => {
	// 		if (xhr.readyState === 4) {
	// 			if (xhr.status === 200) {
	// 				var response = xhr.responseText,
	// 					driver = JSON.parse(response)
	// 				setIsLoaded(true)
	// 				setDriver(driver)
	// 				console.log(driver)
	// 			} else {
	// 				setIsLoaded(true)
	// 				setError(true)
	// 			}
	// 		}
	// 	})
	// 	xhr.open('GET', 'https://qa-interview-test.splytech.dev/api/drivers/', true)
	// 	xhr.send()
	// }, [])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					'http://qa-interview-test.splytech.dev/api/drivers/',
					{
						mode: 'no-cors',
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json'
						}
					}
				)
				const data = await response.json()
				console.log(data)
				// .then(response => response.json())
				// .then(data => {
				// 	setIsLoading(true)
				// 	setDrivers(data)
				// 	console.log(data)
				// })
			} catch (error) {
				setIsLoading(true)
				setError(error)
				console.log(error.message)
			}
		}
		fetchData()
		console.log(fetchData())
	}, [])

	if (loadError) return 'Error loading maps'
	if (!isLoaded) return 'Loading Maps'

	return (
		<div>
			<Search panTo={panTo} />
			<Locate panTo={panTo} />
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
							<h2>Number of Taxis:</h2>
							<p>{formatRelative(selected.time, new Date())}</p>
						</div>
					</InfoWindow>
				) : null}
			</GoogleMap>
		</div>
	)
}

export const Locate = ({ panTo }) => {
	return (
		<button
			className='locate'
			onClick={() => {
				navigator.geolocation.getCurrentPosition(
					position => {
						panTo({
							lat: position.coords.latitude,
							lng: position.coords.longitude
						})
					},
					() => null,
					options
				)
			}}
		>
			<img src='compass.svg' alt='compass' />
		</button>
	)
}

export const Search = ({ panTo }) => {
	const {
		ready,
		value,
		suggestions: { status, data },
		setValue,
		clearSuggestions
	} = usePlacesAutocomplete({
		requestOptions: {
			location: { lat: () => 1.285194, lng: () => 103.8522982 },
			radius: 200 * 1000
		}
	})

	return (
		<div className='search'>
			<Combobox
				onSelect={async address => {
					setValue(address, false)
					clearSuggestions()
					try {
						const results = await getGeocode({ address })
						const { lat, lng } = await getLatLng(results[0])
						panTo({ lat, lng })
					} catch (error) {
						console.log('Error!')
					}
				}}
			>
				<ComboboxInput
					value={value}
					onChange={e => {
						setValue(e.target.value)
					}}
					disabled={!ready}
					placeholder='Where are you going?'
				/>
				<ComboboxPopover>
					<ComboboxList>
						{status === 'OK' &&
							data.map(({ id, description }) => (
								<ComboboxOption key={id} value={description} />
							))}
					</ComboboxList>
				</ComboboxPopover>
			</Combobox>
		</div>
	)
}
