<template>
  <div class="m-12">
    <div class="input">
      <span>Employee ID</span>
      <input placeholder="Enter an Employee ID" style="border: 2px solid black;" v-model="id" />
        <p
        v-if="error"
        class="text-red-500 text-xs italic"
      >
        Invalid value
      </p>
    </div>
    <Table :cols="cols" :rows="rows" />
  </div>
</template>

<script>
import Table from "../../components/Table";
export default {
  components: {
    Table
  },
  async mounted() {
    this.employeeIds = await this.$employeeIds();
  },
  data() {
    return {
      employeeIds: [],
      id: null,
      rows: [],
      cols: [
        "Employee ID",
        "First Name",
        "Last Name",
        "Temp.",
        "Symptoms",
        "Last Screening",
        "Last Location",
        "Time Of Entry",
        "Time Of Departure",
        "Room Number"
      ]
    };
  },
  computed: {
    error() {
      if (this.id) return !this.employeeIds.includes(Number(this.id));
    }
  },
  watch: {
    id: async function(newVal) {
      if (this.error) {
        return;
      }
      const { data } = await this.$axios.get(
        "http://localhost:3000/api/reports/screening/" + newVal
      );
      this.rows = data.map(row => {
        return {
          ...row,
          "Last Screening": row["Last Screening"].split("T")[0],
          "Last Location": row["Last Location"].split("T")[0]
        };
      });
    }
  }
};
</script>
