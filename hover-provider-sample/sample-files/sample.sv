module top #(
  parameter NB = 4;
) (
  input [NB-1:0] i_data;
  output [NB-1:0] o_data;
);
assign o_data = i_data;
endmodule