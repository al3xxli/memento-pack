/*
  Memento Pack — Arduino Uno R4 FSR state transmitter

  Wiring: 5V -> FSR -> A0 -> 10k resistor -> GND
  Serial output: STATE:EMPTY | STATE:POCKETS | STATE:SMALL | STATE:HEAVY
*/

const uint8_t FSR_PIN = A0;
const unsigned long SAMPLE_INTERVAL_MS = 30;
const unsigned long SETTLE_MS = 800;
const uint8_t SMOOTHING_SAMPLES = 20;

// Rising and falling thresholds are different on purpose (hysteresis).
// Adjust only after checking real, resting readings in the presentation setup.
const int UP_POCKETS = 8;
const int DOWN_POCKETS = 5;
const int UP_SMALL = 30;
const int DOWN_SMALL = 27;
const int UP_HEAVY = 65;
const int DOWN_HEAVY = 60;

enum PackState { EMPTY, POCKETS, SMALL, HEAVY };

int samples[SMOOTHING_SAMPLES];
long sampleTotal = 0;
uint8_t sampleIndex = 0;
bool bufferReady = false;
unsigned long lastSampleAt = 0;
unsigned long candidateSince = 0;
PackState stableState = EMPTY;
PackState candidateState = EMPTY;

const char* stateName(PackState state) {
  switch (state) {
    case EMPTY: return "EMPTY";
    case POCKETS: return "POCKETS";
    case SMALL: return "SMALL";
    case HEAVY: return "HEAVY";
  }
  return "EMPTY";
}

PackState proposedState(int reading, PackState current) {
  // Determine only adjacent transitions. This prevents a noisy sensor from
  // skipping through intermediary states during removals or additions.
  switch (current) {
    case EMPTY:
      return reading >= UP_POCKETS ? POCKETS : EMPTY;
    case POCKETS:
      if (reading <= DOWN_POCKETS) return EMPTY;
      if (reading >= UP_SMALL) return SMALL;
      return POCKETS;
    case SMALL:
      if (reading <= DOWN_SMALL) return POCKETS;
      if (reading >= UP_HEAVY) return HEAVY;
      return SMALL;
    case HEAVY:
      return reading <= DOWN_HEAVY ? SMALL : HEAVY;
  }
  return EMPTY;
}

void sendState(PackState state) {
  Serial.print("STATE:");
  Serial.println(stateName(state));
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(10); // Uno R4: readings 0–1023.
  for (uint8_t i = 0; i < SMOOTHING_SAMPLES; i++) samples[i] = 0;
  sendState(stableState);
}

void loop() {
  unsigned long now = millis();
  if (now - lastSampleAt < SAMPLE_INTERVAL_MS) return;
  lastSampleAt = now;

  int reading = analogRead(FSR_PIN);
  sampleTotal -= samples[sampleIndex];
  samples[sampleIndex] = reading;
  sampleTotal += reading;
  sampleIndex = (sampleIndex + 1) % SMOOTHING_SAMPLES;
  if (sampleIndex == 0) bufferReady = true;
  if (!bufferReady) return;

  int smoothed = sampleTotal / SMOOTHING_SAMPLES;
  PackState next = proposedState(smoothed, stableState);

  if (next == stableState) {
    candidateState = stableState;
    candidateSince = now;
    return;
  }

  if (next != candidateState) {
    candidateState = next;
    candidateSince = now;
    return;
  }

  if (now - candidateSince >= SETTLE_MS) {
    stableState = candidateState;
    sendState(stableState);
  }
}

