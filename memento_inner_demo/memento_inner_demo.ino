void setup() {
  Serial.begin(115200);
  analogReadResolution(10);  // Readings from 0 to 1023
}

void loop() {
  Serial.println(analogRead(A0));
  delay(200);
}