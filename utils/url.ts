export const getQueryParams = () => {
  const url = new URL(window.location.href)
  const params: { [key: string]: string } = {}
  url.searchParams.forEach((val, key) => {
    params[key] = val
  })
  return params
}
