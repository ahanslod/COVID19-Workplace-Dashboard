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
        "Department Name",
        "First Name",
        "Last Name",
        "DateOfBirth",
        "Sex",
        "Height",
        "Street Number",
        "Street Name",
        "City",
        "Province",
        "Postal Code",
        "Email Address"
      ]
    };
  },
  async mounted() {
    const { data } = await this.$axios.get(
      "http://localhost:3000/api/employees"
    );
    this.rows = data.map(row => {
      return {
        ...row,
        dateOfBirth: row.dateOfBirth.split("T")[0]
      };
    });
  }
};
</script>
