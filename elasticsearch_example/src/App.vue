<template>
    <div id="app">
        <div>
            <button @click="() => {crateIndex();}">создать индекс</button>
            <button @click="() => {deleteIndex();}">удалить индекс</button>
            <button @click="indexTestData">{{!setTestDataRun ? 'загрузить тестовые данные' : 'загрузка ...'}}</button>
            <button @click="() => {clearBlockReadOnly();}">сбросить блокировку только на чтение</button>
            <div style="margin-top: 10px">
                <TextInput style="width: 100px" v-model="urlData"/>
                <button @click="indexData">{{!setDataRun ? 'загрузить по ссылке' : 'загрузка ...'}}</button>
            </div>
        </div>

        <div style="margin-top: 10px">
            <TextInput @keyup.enter="find" v-model="searchText"/>
            <button @click="find">{{!findRun ? 'поиск' : 'ищу ...'}}</button>
        </div>

        <div style="margin-top: 10px">
            <div style="margin-top: 20px" v-for="(item, index) in findItems" :key="index">
                <div style="max-width: 400px; overflow: hidden; white-space: nowrap;">{{`${index + 1}. `}}
                    <a target="_blank" style="cursor: pointer; white-space: nowrap;" :href="item.url">{{item.title || item.url}}</a>
                </div>
                <div style="color: #757575;" v-html="h" v-for="(h, index) in item.highlightContent" :key="index"></div>
            </div>
        </div>

        <!--<pre>{{searchResultText}}</pre>-->
    </div>
</template>

<script>
  import TextInput from './components/TextInput'
  import {crateIndex, setData, search, deleteIndex, setTestData, clearBlockReadOnly} from './api/elastic'

  export default {
    name: 'app',
    methods: {
      crateIndex,
      setData,
      search,
      deleteIndex,
      setTestData,
      clearBlockReadOnly,
      async find() {
        let searchText = this.searchText;
        this.findRun = true;
        try {
          let r = await this.search(searchText);
          this.searchResult = r;
        } finally {
          this.findRun = false;
        }
      },
      async indexTestData() {
        this.setTestDataRun = true;
        try {
          await this.setTestData();
        } finally {
          this.setTestDataRun = false;
        }
      },
      async indexData() {
        debugger;
        if (!this.urlData) return;
        this.setDataRun = true;
        try {
          await this.setData(this.urlData);
          this.urlData = null;
        } finally {
          this.setDataRun = false;
        }
      }
    },
    components: {TextInput},
    computed: {
      findItems() {
        let {searchResult: r} = this;

        if (!r) return [];

        let hits = r.hits;
        if (!hits || hits.length <= 0) return [];
        let hitshits = hits.hits;
        if (!hitshits || hitshits.length <= 0) return [];


        let items = hitshits.map(a => ({
          content: a._source.content,
          url: a._source.url,
          title: a._source.title,
          highlightContent: a.highlight && a.highlight.text,
        }));
        return items;

      },
      searchResultText() {
        if (!this.searchResult) return null;

        let json = JSON.stringify(this.searchResult, "", 2);
        return json;
      }
    },
    data() {
      return {
        urlData: null,
        searchText: "Puthon",
        searchResult: null,
        setTestDataRun: false,
        setDataRun: false,
        findRun: false,
      }
    }
  }
</script>

<style lang="scss">
    #app {

    }

    em {
        color: black;
        font-weight: bold;
        font-size: 17px;
        font-style: normal;
    }
</style>
