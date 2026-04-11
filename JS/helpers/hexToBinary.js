function hexToBinary(hex) {
    const map = {
      '0': '0000',
      '1': '0001',
      '2': '0010',
      '3': '0011',
      '4': '0100',
      '5': '0101',
      '6': '0110',
      '7': '0111',
      '8': '1000',
      '9': '1001',
      'A': '1010',
      'B': '1011',
      'C': '1100',
      'D': '1101',
      'E': '1110',
      'F': '1111'
    };
  
    return hex
      .toUpperCase()
      .split('')
      .map(char => map[char])
      .join('');
  }
  
  console.log(hexToBinary("1AF3"));
  console.log(hexToBinary("D2FE28")); //110100101111111000101000



  function parseLiteralPacket(binary) {
    // Skip first 6 bits: 3 for the headers (version + 3 for type ID)
    let index = 6;
    let valueBits = "";
  
    while (true) {
      const group = binary.slice(index, index + 5);//group is composed of five binary digits
  
      // Take last 4 bits only
      valueBits += group.slice(1);
  
      index += 5;
  
      // If prefix is 0, this is the last group
      if (group[0] === "0") {
        break;
      }
    }
  
    return {
      binaryValue: valueBits,
      decimalValue: parseInt(valueBits, 2)// to convert the valueBits from binary to decimal. 2 repesents the numbering base (2:binary, 16: hex,...etc)
    };
  }
  
  //packet: D2FE28 in binary
  const binaryPacket = "110100101111111000101000";
  
  const result = parseLiteralPacket(binaryPacket);
  
  console.log("Binary literal:", result.binaryValue);   // 011111100101
  console.log("Decimal value:", result.decimalValue);   // 2021