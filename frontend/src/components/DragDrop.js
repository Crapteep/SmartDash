import React, { useState, useEffect } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
// import "./styles.css";
import Widget from "./Widget";
import LineChart from "./LineChart";
import AreaChart from "./AreaChart";
import BarChart from "./BarChart";
import ScatterChart from "./ScatterChart";
import OutlinedButton from "./Buttons/OutlinedButton";
import ContainedButton from "./Buttons/ContainedButton";
import TopBar from "./TopBar";


const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalItems = ["a", "b", "c", "d", "e", "f"];

const componentList = {
    a: LineChart,
    b: AreaChart,
    c: BarChart,
    d: ScatterChart,
    e: OutlinedButton,
    f: ContainedButton,
  };

const DropDrag = ({
      deviceList,
      selectedDevice,
      handleUpdateLayout,
      layout,
      setLayout,
      handleChangeDevice,
      itemList,
      props
    }) => {
  
  // const [layouts, setLayouts] = useState(layout2);
  const [items, setItems] = useState(itemList);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [compactType, setCompactType] = useState("vertical");
  const [mounted, setMounted] = useState(false);
  const [toolbox, setToolbox] = useState({
    lg: [],
  });
  
// do ogarniecia bo na razie iteruje po layouts zamiast po items.

  useEffect(() => {
    // Przyjmuje nowy itemList z propsów i ustawia go w stanie lokalnym items
    setItems(itemList);
  }, [itemList]);



  useEffect(() => {
    setMounted(true);
  }, []);


  const handleButtonClick = () => {
    console.log("handlebuttonclick");
    if (isEditMode) {
      onLayoutSave();
    } else {
      onLayoutEdit();
    }
    setIsEditMode((prevEditMode) => !prevEditMode);
  };

  const onLayoutEdit = () => {
    // setIsEditMode((prevEditMode) => !prevEditMode);
    console.log("edit", isEditMode);
  };
  const onBreakpointChange = (breakpoint) => {
    setCurrentBreakpoint(breakpoint);
    setToolbox({
      ...toolbox,
      [breakpoint]: toolbox[breakpoint] || toolbox[currentBreakpoint] || [],
    });
  };

  const onCompactTypeChange = () => {
    let oldCompactType = compactType;
    const newCompactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical"
        ? null
        : "horizontal";
    setCompactType(newCompactType);
  };

  const handleSelectionChange = (itemName, isSelected) => {
    if (isSelected) {
      setItems((prevItems) => [...prevItems, itemName]);
    } else {
      setItems((prevItems) => prevItems.filter((item) => item !== itemName));
    }
  };

  const onLayoutChange = (layout, layouts) => {
    setLayout({ ...layouts });
  };

  const onLayoutSave = () => {
    // setLayout(layout);
    // saveToLS("layouts", layout);
    handleUpdateLayout();
  };

  const onDrop = (layout, layoutItem, _ev) => {
    alert(
      `Element parameters:\n${JSON.stringify(
        layoutItem,
        ["x", "y", "w", "h"],
        2
      )}`
    );
  };

  const onRemoveItem = (itemId) => {
    setItems(items.filter((i) => i !== itemId));
  };

  const onAddItem = (itemId) => {
    setItems([...items, itemId]);
  };

  const handleTestButtonClick = () => {
    console.log('selectedDevice ->', selectedDevice,
    'layout ->', layout,
    'deviceList ->', deviceList,
    "item list -> ", itemList)
  }

  const generateDOM = () => {
    return _.map(layout.lg, function (l, count) {
      const key = l.i;
      const gridData = { x: l.x, y: l.y, w: l.w, h: l.h };
      const selectedComponent = componentList[key]; // Wybieramy komponent na podstawie 'i'.
      return (
        <div
          key={key}
          style={{ background: "#ccc" }}
          className={l.static ? "static" : ""}
        >
          {l.static ? (
            <span
              className="text"
              title="This item is static and cannot be removed or resized."
            >
              
            </span>
          ) : (
              <Widget
                  id={key}
                  className="text"
                  onRemoveItem={onRemoveItem}
                  component={selectedComponent}
                  isEditMode={isEditMode}
                />
            // <span className="text">{i}</span>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <button onClick={handleTestButtonClick}>test</button>
      <TopBar
        items={items}
        onRemoveItem={onRemoveItem}
        onAddItem={onAddItem}
        originalItems={originalItems}
        onSelectionChange={handleSelectionChange}
        isEditMode={isEditMode}
        handleButtonClick={handleButtonClick}
        deviceList={deviceList}
        selectedDevice={selectedDevice}
        handleChangeDevice={handleChangeDevice}
        
      />
      <div className="mb-4 layout">
        <ResponsiveReactGridLayout
          {...props}
          style={{ border: "1px solid #ccc", borderRadius: "4px"}}

          layouts={layout}
          measureBeforeMount={false}
          useCSSTransforms={mounted}
          compactType={compactType}
          preventCollision={!compactType}
          onLayoutChange={onLayoutChange}
          onBreakpointChange={onBreakpointChange}
          onDrop={onDrop}
          isDroppable
        >
          {generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    </>
  );
};


export default DropDrag;


DropDrag.defaultProps = {
  className: "layout",
  rowHeight: 30,
  onLayoutChange: (layout, layouts) => {},
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  containerPadding: [0, 0],
};


