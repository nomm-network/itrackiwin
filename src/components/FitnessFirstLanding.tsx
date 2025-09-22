import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import OrbitPlanetsPage from '@/features/planets/OrbitPlanetsPage';

const FitnessFirstLanding: React.FC = () => {
  const navigate = useNavigate();
  const [showOrbits, setShowOrbits] = useState(false);
  const [carouselImages, setCarouselImages] = useState<Array<{ src: string; alt: string }>>([]);

  useEffect(() => {
    // Set default images immediately to prevent loading issues
    const defaultImages = [
      { src: '/placeholder.svg', alt: "Fitness tracking interface" },
      { src: '/placeholder.svg', alt: "Workout progress tracking" },
      { src: '/placeholder.svg', alt: "Exercise planning interface" }
    ];
    
    setCarouselImages(defaultImages);

    const fetchCarouselImages = async () => {
      try {
        const { data, error } = await supabase
          .from('carousel_images')
          .select('file_url, alt_text')
          .eq('is_active', true)
          .order('order_index');

        if (error) {
          console.log('No carousel_images table or error fetching:', error.message);
          return; // Keep default images
        }

        if (data && data.length > 0) {
          setCarouselImages(data.map(img => ({
            src: img.file_url,
            alt: img.alt_text
          })));
        }
      } catch (error) {
        console.log('Error fetching carousel images:', error);
        // Keep default images - no need to set again
      }
    };

    // Add a small delay to prevent blocking the initial render
    const timeoutId = setTimeout(fetchCarouselImages, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  if (showOrbits) {
    return <OrbitPlanetsPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Your Fitness, Smarter</h1>
          <p className="text-muted-foreground text-lg">
            Track workouts, readiness, and progress.<br />
            Fitness is just the beginning.
          </p>
        </div>

        {/* Carousel */}
        <div className="w-full space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Sneak peek 👀</h2>
            <p className="text-muted-foreground text-sm">See what's coming to your fitness journey</p>
          </div>
          <Carousel className="w-full">
            <CarouselContent>
              {carouselImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-[9/16] items-center justify-center p-2">
                        <img 
                          src={image.src} 
                          alt={image.alt}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
          >
            Start with Fitness
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setShowOrbits(true)}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            🌍 Explore all life areas →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FitnessFirstLanding;