-- Create inquiries table to store form submissions
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_contact TEXT DEFAULT 'email',
  -- Services interested in
  services TEXT[] NOT NULL DEFAULT '{}',
  -- Horse details
  horse_name TEXT,
  horse_age TEXT,
  horse_breed TEXT,
  -- Project details
  project_vision TEXT,
  project_details TEXT,
  -- Experience & budget
  experience_level TEXT,
  budget_range TEXT,
  preferred_start TEXT,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert inquiries (public form)
CREATE POLICY "Anyone can submit an inquiry"
  ON public.inquiries
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow only authenticated admins to view inquiries
-- For now, we'll allow select for service_role only (backend access)
-- This keeps inquiries private and only accessible via the Cloud dashboard

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();