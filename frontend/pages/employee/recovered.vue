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
      cols: [
        "Employee Id",
        "Date Recovered",
        "Date Of Return",
        "Has Proof Of Clearance"
      ]
    };
  },
  async mounted() {
    const { data } = await this.$axios.get(
      "http://localhost:3000/api/employees/recovered"
    );
    this.rows = data.map(row => {
      return {
        ...row,
        dateOfReturn: row.dateOfReturn.split("T")[0],
        dateOfRecovered: row.dateOfRecovered.split("T")[0]
      };
    });
  }
};
</script>
