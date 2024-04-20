export function binaryInsert(arr: any[], item: any, keyMapper?: any, unique?: boolean): number {
  if (typeof (keyMapper) == 'boolean') {
    unique = keyMapper
    keyMapper = undefined
  }

  let low = 0
  let high = arr.length - 1
  let mid: number = Number.NaN
  const itemValue = keyMapper ? keyMapper(item) : item

  while (low <= high) {
    mid = ((high + low) / 2) | 0
    const midValue = keyMapper ? keyMapper(arr[mid]) : arr[mid]
    if (itemValue === midValue) {
      if (unique)
        return mid
      else
        break
    }
    else if (itemValue > midValue) {
      low = mid + 1
    }
    else if (itemValue < midValue) {
      high = mid - 1
    }
  }
  const index = low > mid ? mid + 1 : mid
  arr.splice(index, 0, item)
  return index
}
