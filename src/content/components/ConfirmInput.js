import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import {
  CodeField,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

const CELL_COUNT = 4; // Number of input cells

const ConfirmInput = ({ onCodeFilled }) => {
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Callback when the code is fully entered
  const handleCodeChange = (code) => {
    setValue(code);
    if (code.length === CELL_COUNT) {
      onCodeFilled && onCodeFilled(code);
    }
  };

  return (
    <View style={styles.container}>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={handleCodeChange}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            style={[styles.cell, isFocused && styles.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}
          >
            <Text style={styles.cellText}>
              {symbol || (isFocused ? "|" : null)}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 0, alignItems: "center" },
  codeFieldRoot: {},
  cell: {
    width: 50,
    height: 50,
    lineHeight: 48,
    fontSize: 30,
    borderWidth: 1,
    borderColor: "#00000030",
    textAlign: "center",
    marginHorizontal: 5,
    backgroundColor: "#eaebef",
    color: "#000",
  },
  cellText: { textAlign: "center", fontSize: 34 },
  focusCell: {
    borderColor: "#000",
  },
});

export default ConfirmInput;
