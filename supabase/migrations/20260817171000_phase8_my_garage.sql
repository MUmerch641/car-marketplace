-- Phase 8: My Garage (Refined)

DROP TABLE IF EXISTS public.garage_vehicles CASCADE;

CREATE TABLE public.garage_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    fuel_type public.fuel_type NOT NULL,
    colour TEXT NOT NULL,
    engine_size TEXT,
    mot_expiry DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive & space-insensitive unique index on registration per customer
CREATE UNIQUE INDEX garage_vehicles_customer_registration_idx 
ON public.garage_vehicles (customer_id, upper(replace(registration, ' ', '')));

-- RLS
ALTER TABLE public.garage_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own garage vehicles" 
    ON public.garage_vehicles FOR SELECT 
    TO authenticated
    USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own garage vehicles" 
    ON public.garage_vehicles FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own garage vehicles" 
    ON public.garage_vehicles FOR UPDATE 
    TO authenticated
    USING (auth.uid() = customer_id) 
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own garage vehicles" 
    ON public.garage_vehicles FOR DELETE 
    TO authenticated
    USING (auth.uid() = customer_id);

-- Set updated_at trigger
CREATE TRIGGER garage_vehicles_set_updated_at 
BEFORE UPDATE ON public.garage_vehicles 
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.garage_vehicles TO authenticated;
