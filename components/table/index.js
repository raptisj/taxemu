import IncomeTable from "./IncomeTable";
import EmployeeTable from "./EmployeeTable";
import BusinessTable from "./BusinessTable";
import TableHeader from "./TableHeader";
import MobileBusinessTable from "./MobileBusinessTable";

const Table = {
  IncomeTable,
  Employee: EmployeeTable,
  Business: BusinessTable,
  Header: TableHeader,
  MobileBusinessTable
};

export default Table;
