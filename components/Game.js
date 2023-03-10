import { useState, useEffect }                                                               from 'react'
import { StyleSheet, Text, View, PixelRatio, useColorScheme }                                from 'react-native'
import { GestureHandlerRootView, TapGestureHandler, FlingGestureHandler, Directions, State } from 'react-native-gesture-handler'
import n2words                                                                               from 'n2words'
import * as Speech                                                                           from 'expo-speech'
import EventBus                                                                              from 'just-event-bus'

import Translate from './Translate'
import Button    from './Button'

export default function Game({ prefs }) {
  const { minNumber, maxNumber, language, locale, voice } = prefs
  const colorScheme = useColorScheme()
  const theme = prefs.theme || colorScheme

  const tr = Translate(locale)

  const [number, setNumber] = useState(null)
  const [numberText, setNumberText] = useState('')

  const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const changeNumber = _ => {
    let newNumber
    if (minNumber === 0 && maxNumber > 0) {
      // make it gradual
      const l1 = minNumber.toString().length
      const l2 = (maxNumber - 1).toString().length // 1000 to 999
      const l = randomBetween(l1, l2)
      const max = Math.min(+'9'.repeat(l) + 1, maxNumber)

      newNumber = randomBetween(minNumber, max)
    } else {
      // TODO: improve me too!
      newNumber = randomBetween(minNumber, maxNumber)
    }
    setNumber(newNumber)
    if (prefs.showAnswer) showAnswer(newNumber)
    else setNumberText('')
  }

  const voicePresent = voice && voice !== '-'

  const showAnswer = number => {
    const text = n2words(number, { lang: language })
    setNumberText(text)
    if (voicePresent) {
      Speech.stop()
      Speech.speak(text, { language: language, voice: voice })
    }
  }

  const openSettings = _ => {
    EventBus.emit('openSettings')
  }

  const onTap = event => {
    if (event.nativeEvent.state === State.ACTIVE) showAnswer()
  }

  const onSwipe = event => {
    if (event.nativeEvent.state === State.ACTIVE) changeNumber()
  }

  useEffect(() => {
    if (number === null) changeNumber()
  })

  const numberColor = theme === 'dark' ? '#c3c3c3' : 'black'
  const numberTextColor = theme === 'dark' ? '#aaa' : '#555'

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlingGestureHandler
        direction={Directions.RIGHT | Directions.LEFT}
        onHandlerStateChange={onSwipe}
      >
        <View style={styles.internalContainer}>
          <Button prefs={prefs} icon="feather/settings" onPress={openSettings} color="grey" style={{ position: 'absolute', top: 10, right: 10 }}/>
          <TapGestureHandler onHandlerStateChange={onTap}>
            <Text style={{ ...styles.number, color: numberColor }}>{number}</Text>
          </TapGestureHandler>
          <Text style={{ ...styles.numberText, color: numberTextColor }}>{numberText}</Text>
          <View style={styles.footerContainer}>
            {!prefs.showAnswer && <Button prefs={prefs} title={tr('showAnswer')} color="blue" icon={voicePresent ? 'foundation/sound' : null} onPress={_ => showAnswer(number)} />}
            <Button prefs={prefs} title={tr('nextNumber')} color="red" onPress={changeNumber} />
          </View>
        </View>
      </FlingGestureHandler>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    flexGrow: 1,
    paddingTop: 5,
  },
  internalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    flexGrow: 1,
    width: '100%',
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    width: '100%',
  },
  number: {
    fontSize: PixelRatio.get() * 40,
    textAlign: 'center',
  },
  numberText: {
    fontSize: PixelRatio.get() * 18,
    textAlign: 'center',
  },
})
