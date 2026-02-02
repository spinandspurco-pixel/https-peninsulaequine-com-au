-- Create employee tasks table
CREATE TABLE public.employee_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    scheduled_time TIME,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_tasks
-- Employees can view their own tasks
CREATE POLICY "Employees can view own tasks"
ON public.employee_tasks
FOR SELECT
USING (assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Employees can update their own task status
CREATE POLICY "Employees can update own task status"
ON public.employee_tasks
FOR UPDATE
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());

-- Admins can manage all tasks
CREATE POLICY "Admins can manage all tasks"
ON public.employee_tasks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for announcements
-- Everyone with employee or admin role can view active announcements
CREATE POLICY "Staff can view active announcements"
ON public.announcements
FOR SELECT
USING (
    active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (has_role(auth.uid(), 'employee'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements"
ON public.announcements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on employee_tasks
CREATE TRIGGER update_employee_tasks_updated_at
BEFORE UPDATE ON public.employee_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();