CREATE POLICY "Authenticated users can subscribe to realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can broadcast on realtime"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);