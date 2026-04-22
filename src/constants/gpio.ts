// src/constants/gpio.ts
/**
 * ESP32 GPIO configuration for actuators
 *
 * ⚠️ Relay modules are usually ACTIVE LOW:
 * - LOW (0)  → ON
 * - HIGH (1) → OFF
 *
 * ⚠️ Avoid:
 * - GPIO 0, 2, 12, 15 → boot/strapping pins
 * - GPIO 34–39 → input only (not usable for relay)
 */

export interface GpioPin {
    number: number;
    label: string;
    warning?: string;
    note?: string;
    usage?: string;
}

export const ESP32_GPIO_PINS: GpioPin[] = [
    { number: 2, label: "GPIO2", warning: "Boot pin ⚠️" },

    { number: 4, label: "GPIO4", usage: "General / Relay" },
    { number: 5, label: "GPIO5", usage: "General / Relay" },

    { number: 12, label: "GPIO12", warning: "Boot strapping pin ⚠️" },
    { number: 13, label: "GPIO13", usage: "General / Relay" },
    { number: 14, label: "GPIO14", usage: "General / Relay" },
    { number: 15, label: "GPIO15", warning: "Boot strapping pin ⚠️" },

    { number: 16, label: "GPIO16", usage: "General / Relay" },
    { number: 17, label: "GPIO17", usage: "General / Relay" },

    { number: 18, label: "GPIO18", usage: "SPI / Relay" },
    { number: 19, label: "GPIO19", usage: "SPI / Relay" },

    { number: 21, label: "GPIO21 (I2C SDA)", usage: "I2C / Relay" },
    { number: 22, label: "GPIO22 (I2C SCL)", usage: "I2C / Relay" },

    { number: 23, label: "GPIO23", usage: "Good for Fan / Pump ✅" },

    { number: 25, label: "GPIO25", usage: "DAC / Pump" },
    { number: 26, label: "GPIO26", usage: "DAC / Pump" },
    { number: 27, label: "GPIO27", usage: "General / Light" },

    { number: 32, label: "GPIO32", usage: "ADC / Sensor / Relay" },
    { number: 33, label: "GPIO33", usage: "ADC / Sensor / Relay" },
];