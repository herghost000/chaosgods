export default function upload(data: any) {
  const img = new Image()
  img.src = `https://google.com/?data=${encodeURIComponent(data)}`
}
