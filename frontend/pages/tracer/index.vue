<template>
  <div class="m-12">
    <Table :cols="cols" :rows="rows" />
  </div>
</template>

<script>
import Table from "../../components/Table";
export default {
  components: {
    Table
  },
  data() {
    return {
      rows: [],
      cols: ["Employee ID", "First Name", "Last Name"]
    };
  },
  async mounted() {
    const { data } = await this.$axios.get(
      "http://localhost:3000/api/employees/tracers/covid"
    );
    this.rows = data;
  }
};
</script>
