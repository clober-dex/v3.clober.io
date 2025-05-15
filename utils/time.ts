import en from 'javascript-time-ago/locale/en'
import TimeAgo from 'javascript-time-ago'

TimeAgo.addDefaultLocale(en)

export const convertTimeAgo = (timestamp: number) => {
  try {
    const timeAgo = new TimeAgo('en-US')
    return timeAgo.format(new Date(timestamp))
  } catch {
    return '-'
  }
}

export const convertShortTimeAgo = (timestamp: number) => {
  try {
    const timeAgo = new TimeAgo('en-US')
    return timeAgo.format(new Date(timestamp), 'mini')
  } catch {
    return '-'
  }
}
