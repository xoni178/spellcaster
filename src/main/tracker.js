const { exec, execFile } = require('child_process')
const EventEmitter = require('events')
const fs = require('fs')

import { saveGamePlayedTime } from './localData'

const eventEmiter = new EventEmitter()

function todaysDate() {
  let today = new Date()
  let day = String(today.getDate()).padStart(2, '0')
  let month = String(today.getMonth() + 1).padStart(2, '0')
  let year = today.getFullYear()

  let formattedDate = `${day}.${month}.${year}`

  return formattedDate
}

function closeExternalAppWindows(appName) {
  exec(`tasklist`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error listing tasks: ${stderr}`)
      return
    }

    const lines = stdout.split('\n')
    const appLine = lines.find((line) => line.includes(appName))

    if (appLine) {
      const pid = appLine.trim().split(/\s+/)[1]
      exec(`taskkill /PID ${pid} /F`, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error killing task: ${stderr}`)
        } else {
          console.log(`Process ${appName} (PID: ${pid}) terminated.`)
        }
      })
    } else {
      console.log(`Process ${appName} not found.`)
    }
  })
}

function executeGameExe(exeFilePATH, exeFileNAME) {
  exec(`tasklist /FI "IMAGENAME eq ${exeFileNAME}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      return
    }

    if (!stdout.includes(exeFileNAME) && fs.existsSync(exeFilePATH)) {
      execFile(exeFilePATH, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`)
          return
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`)
          return
        }
        console.log(`Stdout: ${stdout}`)
      })
    } else {
      console.log(`${exeFileNAME} is already running.`)
    }
  })
}

function checkAppRunning(exeFileName) {
  const gameID = Object.keys(exeFileName)[0]

  if (!gameID) return

  const appName = exeFileName[gameID]?.exeFileName
  const isPlaying = exeFileName[gameID]?.isPlaying
  let playedTimeSeconds = exeFileName[gameID]?.playedTimeSeconds

  exec(`tasklist /FI "IMAGENAME eq ${appName}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      return
    }

    if (stdout.includes(appName)) {
      const playedTimeSec = playedTimeSeconds + 2
      exeFileName[gameID].isPlaying = true
      exeFileName[gameID].playedTimeSeconds = playedTimeSec
      exeFileName[gameID].lastDatePlayed = todaysDate()
      saveGamePlayedTime(exeFileName)
      eventEmiter.emit('changed-played-time')
    } else {
      if (isPlaying) {
        exeFileName[gameID].isPlaying = false
        saveGamePlayedTime(exeFileName)
        eventEmiter.emit('changed-played-time')
      }
    }
  })
}

export { checkAppRunning, executeGameExe, closeExternalAppWindows, eventEmiter }
