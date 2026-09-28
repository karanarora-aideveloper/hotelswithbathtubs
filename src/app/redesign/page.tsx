import React from "react";
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import RedesignClient from './RedesignClient';

export const metadata = {
  title: 'Redesign Preview | HotelsWithBathtubs - Full-Width Verified Directory',
  description: 'Verified bathtub hotels with neighborhood area filters, global destination search, and full-width interactive map.',
};

async function getData(city: string = 'Delhi') {
  try {
    await connectToDatabase();
    const [hotels, cities] = await Promise.all([
      Hotel.find({
        city: new RegExp(`^${city}$`, 'i'),
        flagged: { $ne: true }
      })
        .sort({ rating: -1, reviewsCount: -1 })
        .limit(60)
        .lean(),
      Hotel.distinct('city')
    ]);

    const validCities = cities.filter(Boolean).sort((a: string, b: string) => a.localeCompare(b));

    return {
      hotels: JSON.parse(JSON.stringify(hotels)),
      cities: validCities
    };
  } catch (error) {
    console.error('Error fetching hotels for redesign preview:', error);
    return { hotels: [], cities: [] };
  }
}

export default async function RedesignPage() {
  const city = 'Delhi';
  const { hotels, cities } = await getData(city);

  return (
    <RedesignClient 
      initialCity={city} 
      initialHotels={hotels} 
      allCities={cities} 
    />
  );
}
