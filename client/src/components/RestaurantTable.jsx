import React, { useState, useEffect } from 'react';
import useGeolocation from '../hooks/useGeolocation';

const RestaurantTable = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const userLocation = useGeolocation();

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/api/restaurants`)
            .then(res => res.json())
            .then(data => {
                setRestaurants(data);
                setFilteredRestaurants(data);
            })
            .catch(err => console.error('Error fetching restaurants:', err));
    }, []);

    // Distance calculation (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in meters
    };

    // Filtering
    useEffect(() => {
        if (searchTerm.length >= 3) {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = restaurants.filter(r =>
                r.name.toLowerCase().includes(lowerTerm) ||
                r.address.toLowerCase().includes(lowerTerm) ||
                (r.comments && r.comments.toLowerCase().includes(lowerTerm))
            );
            setFilteredRestaurants(filtered);
        } else {
            setFilteredRestaurants(restaurants);
        }
    }, [searchTerm, restaurants]);

    // Sorting
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedRestaurants = React.useMemo(() => {
        let sortableItems = [...filteredRestaurants];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle special cases
                if (sortConfig.key === 'distance') {
                    aValue = calculateDistance(userLocation.coordinates.lat, userLocation.coordinates.lng, a.coordinates.lat, a.coordinates.lng) || Infinity;
                    bValue = calculateDistance(userLocation.coordinates.lat, userLocation.coordinates.lng, b.coordinates.lat, b.coordinates.lng) || Infinity;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredRestaurants, sortConfig, userLocation]);

    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search restaurants (min 3 chars)..."
                    className="w-full p-2 border rounded shadow-sm focus:ring focus:ring-blue-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('visited')}>
                                Visitado {getClassNamesFor('visited') === 'ascending' ? '▲' : getClassNamesFor('visited') === 'descending' ? '▼' : ''}
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('name')}>
                                Nombre {getClassNamesFor('name') === 'ascending' ? '▲' : getClassNamesFor('name') === 'descending' ? '▼' : ''}
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('address')}>
                                Dirección {getClassNamesFor('address') === 'ascending' ? '▲' : getClassNamesFor('address') === 'descending' ? '▼' : ''}
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Horarios
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('comments')}>
                                Comentarios {getClassNamesFor('comments') === 'ascending' ? '▲' : getClassNamesFor('comments') === 'descending' ? '▼' : ''}
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Maps
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('distance')}>
                                Distancia {getClassNamesFor('distance') === 'ascending' ? '▲' : getClassNamesFor('distance') === 'descending' ? '▼' : ''}
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('lastUpdated')}>
                                Última Act. {getClassNamesFor('lastUpdated') === 'ascending' ? '▲' : getClassNamesFor('lastUpdated') === 'descending' ? '▼' : ''}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRestaurants.map((restaurant) => {
                            const distance = calculateDistance(
                                userLocation.coordinates.lat,
                                userLocation.coordinates.lng,
                                restaurant.coordinates.lat,
                                restaurant.coordinates.lng
                            );

                            return (
                                <tr key={restaurant.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {restaurant.visited ? '✅' : '❌'}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {restaurant.name}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {restaurant.address}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        {restaurant.openingHours ? (
                                            <ul className="list-disc pl-4 text-xs">
                                                {restaurant.openingHours.map((h, i) => <li key={i}>{h}</li>)}
                                            </ul>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {restaurant.comments}
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Placeholder for Maps Thumbnail - requires API Key for Static Maps */}
                                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">
                                            Map
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {distance ? `${Math.round(distance)} m` : 'Calculating...'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(restaurant.lastUpdated).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RestaurantTable;
