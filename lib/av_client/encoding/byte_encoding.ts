import { ContestConfig, ContestSelection, OptionSelection, Option } from "../types"
import { flattenOptions } from '../flatten_options'
import { ByteArrayReader } from './byte_array_reader'
import { ByteArrayWriter } from "./byte_array_writer"


export function byteArrayToContestSelection( contestConfig: ContestConfig, byteArray: Uint8Array ): ContestSelection {
  const { reference, markingType, options } = contestConfig
  const codeSize = markingType.encoding.codeSize

  const flatOptions = flattenOptions(options)
  const referenceMap = extractReferenceMap(flatOptions)
  const writeInMap = extractWriteInMap(flatOptions)

  const optionSelections: OptionSelection[] = []

  const reader = new ByteArrayReader(byteArray)

  while( reader.hasMore() ){
    const code = reader.readInteger(codeSize)
    if( code === 0 ) throw new Error('ArgumentError: Unexpecked bytes found in byte array')

    const reference = referenceMap[code]
    if( !reference ) throw new Error('ArgumentError: Unexpected option code encountered')
    // Is the selected option a write in?
    const writeIn = writeInMap[reference]
    if( writeIn ){
      const text = reader.readString(writeIn.maxSize)
      optionSelections.push({ reference, text: text })
    } else {
      optionSelections.push({ reference })
    }
  }

  return {
    reference,
    optionSelections: optionSelections
  }
}


export function contestSelectionToByteArray( contestConfig: ContestConfig, contestSelection: ContestSelection ): Uint8Array {
  const { reference, markingType, options } = contestConfig
  if( reference !== contestSelection.reference ){
    throw new Error("contest selection does not match contest")
  }

  const flatOptions = flattenOptions(options)
  const codeMap = extractCodeMap(flatOptions)
  const writeInMap = extractWriteInMap(flatOptions)

  const writer = new ByteArrayWriter(markingType.encoding.maxSize)

  contestSelection.optionSelections.forEach(optionSelection => {
    const writeIn = writeInMap[optionSelection.reference]
    const code = codeMap[optionSelection.reference]

    if( ! code ) throw new Error("Option reference not found")
    if( writeIn && writeIn.encoding !== 'utf8' ) throw new Error(`Unsupported encoding '${writeIn.encoding}' for write in`)

    writer.writeInteger(markingType.encoding.codeSize, code)

    if( writeIn ){
      const text = optionSelection.text || ''
      writer.writeString(writeIn.maxSize, text)
    } 
  })

  return writer.getByteArray()
}


function extractWriteInMap(flatOptions: Option[]){
  const writeInOptions = flatOptions.filter(option => option.writeIn)
  return Object.fromEntries(writeInOptions.map(option => [option.reference, option.writeIn]))
}

function extractCodeMap(flatOptions: Option[]){
  return Object.fromEntries(flatOptions.map(option => [option.reference, option.code]))
}

function extractReferenceMap(flatOptions: Option[]){
  return Object.fromEntries(flatOptions.map(option => [option.code, option.reference]))
}
