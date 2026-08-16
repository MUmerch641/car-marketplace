CREATE OR REPLACE FUNCTION public.create_service_booking(
  p_service_type_id uuid,
  p_car_make text,
  p_car_model text,
  p_car_registration text,
  p_address_line_1 text,
  p_address_line_2 text,
  p_city text,
  p_postcode text,
  p_preferred_date date,
  p_preferred_time time,
  p_notes text DEFAULT null
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_id uuid;
  v_price numeric;
BEGIN
  IF auth.uid() IS NULL OR p_preferred_date < current_date OR trim(p_car_make) = '' OR trim(p_car_model) = '' OR trim(p_address_line_1) = '' OR trim(p_city) = '' OR trim(p_postcode) !~* '^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$' THEN
    RAISE EXCEPTION 'Invalid booking request';
  END IF;

  SELECT base_price INTO v_price FROM public.service_types WHERE id = p_service_type_id AND is_active;
  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Service unavailable';
  END IF;

  INSERT INTO public.service_bookings (
    customer_id,
    service_type_id,
    car_make,
    car_model,
    car_registration,
    address_line_1,
    address_line_2,
    city,
    postcode,
    preferred_date,
    preferred_time,
    notes,
    quoted_price
  ) VALUES (
    auth.uid(),
    p_service_type_id,
    trim(p_car_make),
    trim(p_car_model),
    nullif(trim(p_car_registration), ''),
    trim(p_address_line_1),
    nullif(trim(p_address_line_2), ''),
    trim(p_city),
    upper(trim(p_postcode)),
    p_preferred_date,
    p_preferred_time,
    nullif(trim(p_notes), ''),
    v_price
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
