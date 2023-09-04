//@ts-check
// not all options are watched here

import { subscribeKey } from 'valtio/utils'
import { options } from './optionsStorage'
import { reloadChunks } from './utils'

subscribeKey(options, 'renderDistance', reloadChunks)
