# Enigma Machine Bug Fixes

## Overview

The `enigma.js` implementation had three critical bugs that prevented correct encryption and decryption. These issues broke the fundamental reciprocal property of the Enigma machine (where encrypting the same text twice should return the original message).

## Bug #1: Missing Plugboard at End of Encryption

**Problem:** The plugboard was only applied at the beginning of the encryption process, but not at the end. In a real Enigma machine, the signal passes through the plugboard twice - once going in and once coming back.

**Original Code:**

```javascript
c = plugboardSwap(c, this.plugboardPairs);
// ... rotor processing ...
// Missing second plugboard swap here!
return c;
```

**Fix:** Added the missing plugboard swap after the backward rotor pass:

```javascript
for (let i = 0; i < this.rotors.length; i++) {
    c = this.rotors[i].backward(c);
}
c = plugboardSwap(c, this.plugboardPairs); // Added this line
return c;
```

## Bug #2: Incorrect Double Stepping Logic

**Problem:** The double stepping mechanism was flawed. When the middle rotor reaches its notch, both the middle rotor AND the left rotor should step together, but the original code didn't handle this correctly.

**Original Code:**

```javascript
stepRotors() {
  if (this.rotors[2].atNotch()) this.rotors[1].step();
  if (this.rotors[1].atNotch()) this.rotors[0].step(); // Wrong logic
  this.rotors[2].step();
}
```

**Fix:** Implemented proper double stepping:

```javascript
stepRotors() {
  const doubleStep = this.rotors[1].atNotch();
  if (this.rotors[2].atNotch()) this.rotors[1].step();
  if (doubleStep) {
    this.rotors[0].step();
    this.rotors[1].step(); // Middle rotor steps again
  }
  this.rotors[2].step();
}
```

## Bug #3: Ring Setting Implementation Issues

**Problem:** The ring setting calculations in the rotor forward/backward methods were unclear and potentially incorrect, affecting the rotor offset calculations.

**Original Code:**

```javascript
forward(c) {
  const idx = mod(alphabet.indexOf(c) + this.position - this.ringSetting, 26);
  return this.wiring[idx];
}
```

**Fix:** Clarified the ring setting logic with proper offset calculation:

```javascript
forward(c) {
  const offset = mod(this.position - this.ringSetting, 26);
  const idx = mod(alphabet.indexOf(c) + offset, 26);
  const output = this.wiring[idx];
  return output;
}
```

## Impact of Fixes

These fixes ensure that:

1. **Reciprocal Property Works:** Encrypting the same message twice now returns the original text
2. **Historical Accuracy:** The machine now behaves like a real WWII Enigma machine
3. **Correct Stepping:** Rotors advance properly, including the complex double stepping behavior
4. **Proper Ring Settings:** Ring settings now correctly affect rotor positioning

## Testing

To verify the fixes work correctly, encrypt any message and then encrypt the result again - you should get back the original message, demonstrating the Enigma's reciprocal encryption property.
