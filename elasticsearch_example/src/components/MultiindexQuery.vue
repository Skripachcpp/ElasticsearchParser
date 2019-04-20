<template>
    <div>
        <div>
            <button @click="() => {crateIndex().then();}">создать индекс</button>
            <button @click="() => {deleteIndex().then();}">удалить индекс</button>
            <button @click="() => {this.setTestDataRun = true; setTestData().finally(() => {this.setTestDataRun = false})}">{{!setTestDataRun ? 'загрузить тестовые данные' : 'загрузка ...'}}</button>
            <button @click="() => {clearBlockReadOnly().then();}">сбросить блокировку только на чтение</button>
        </div>
        <div>
            <div style="margin-top: 10px">
                <TextInput @keyup.enter="find" v-model="searchText"/>
                <button @keyup.enter="find" @click="find">{{!findRun ? 'поиск' : 'ищу ...'}}</button>
            </div>
        </div>

        <pre>{{searchResultText}}</pre>
    </div>
</template>

<script>
import TextInput from './TextInput'
import {crateIndex, setData, search, deleteIndex, setTestData, clearBlockReadOnly} from '../api/multiindexQuery'
export default {
  name: "MultiindexQuery",
  components: {TextInput },
  methods: {
    crateIndex, setData, search, deleteIndex, setTestData, clearBlockReadOnly,
    find() {
      this.findRun = true; search(this.searchText).then(a => this.searchResult = a).finally(() => this.findRun = false);
    }
  },
  computed: {
    searchResultText() {
      if (!this.searchResult) return null;

      let json = JSON.stringify(this.searchResult, "", 2);
      return json;
    }
  },
  data() {
    return {
      setTestDataRun: false,
      findRun: false,
      searchText: '',
      searchResult: null
    }
  }
}
</script>

<style scoped>

</style>
