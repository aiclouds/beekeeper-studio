import { ApplicationEntity } from "./application_entity";
import _ from 'lodash'
import platformInfo from "../common/platform_info";

const { Entity, Column } = require("typeorm");

const TypeDefaults = {
  0: "",
  1: 0,
  2: 0.0,
  3: {},
  4: [],
  5: false
}

const TypeConversion = {
  0: v => v, //string
  1: v => parseInt(v), // int
  2: v => parseFloat(v), // float
  3: v => JSON.parse(v), // object
  4: v => JSON.parse(v), // array
  5: v => v.toLowerCase() === 'true' // boolean
}

function getValue(valueType, valueString) {
  try {
    const result = TypeConversion[valueType](valueString)
    return _.isNil(result) ? TypeDefaults[valueType] : result
  } catch (err) {
    return TypeDefaults[valueType]
  }

}

function setValue(updated) {
  if (_.isString(updated)) {
    return updated
  }
  return JSON.stringify(updated)
}


@Entity({name: 'user_setting'})
export class UserSetting extends ApplicationEntity {

  @Column({type: 'varchar', nullable: false, unique: true})
  key

  _userValue = null
  @Column({type: 'varchar', nullable: false})
  set userValue(updated) {
    this._userValue = setValue(updated)
  }

  get userValue() {
    return getValue(this.valueType, this._userValue)
  }

  get value() {
    const raw = this._userValue || this.platformDefault || this.defaultValue
    return getValue(this.valueType, raw)
  }

  set value(updated) {
    this.userValue = updated
  }

  get platformDefault() {
    if (platformInfo.isMac) return this.macDefault
    if (platformInfo.isWindows) return this.windowsDefault
    return this.linuxDefault
  }

  @Column({type: 'varchar'})
  defaultValue

  @Column({type: 'varchar'})
  linuxDefault

  @Column({type: 'varchar'})
  macDefault

  @Column({type: 'varchar'})
  windowsDefault

  @Column({type: 'integer', nullable: false})
  valueType = 0
}