import IncomeTable from "./IncomeTable";
import EmployeeTable from "./EmployeeTable";
import BusinessTable from "./BusinessTable";
import TableHeader from "./TableHeader";
import MobileBusinessTable from "./MobileBusinessTable";
import MobileEmployeeTable from "./MobileEmployeeTable";

const Table = {
  IncomeTable,
  Employee: EmployeeTable,
  Business: BusinessTable,
  Header: TableHeader,
  MobileBusinessTable,
  MobileEmployeeTable
};

export default Table;
