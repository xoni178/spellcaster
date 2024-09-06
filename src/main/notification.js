const { Notification, app } = require('electron')
const path = require('path')

export const sendNotification = (achievement) => {
  app.setAppUserModelId('SpellCaster')

  const notification = new Notification({
    title: achievement.displayName,
    body: achievement.description,
    icon: path.join(app.getPath('userData'), 'AchievementsCache', achievement.icon)
  })

  notification.show()
}
