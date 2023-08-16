import React, { useState, useEffect } from "react";
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import TopBar from "./TopBar";
import Widget from "./Widget";
import LineChart from "./LineChart";
import AreaChart from "./AreaChart";
import BarChart from "./BarChart";
import ScatterChart from "./ScatterChart";
import OutlinedButton from "./Buttons/OutlinedButton";
import ContainedButton from "./Buttons/ContainedButton";

const originalItems = ["a", "b", "c", "d", "e", "f"];

const initialLayouts = {
  lg: [
    {
      w: 6,
      h: 6,
      x: 0,
      y: 0,
      minW: 3,
      minH: 4,
      maxW: 12,
      maxH: 10,
      i: "a",
      moved: false,
      static: false,
    },
    {
      w: 3,
      h: 6,
      x: 0,
      y: 0,
      minW: 3,
      minH: 4,
      maxW: 12,
      maxH: 10,
      i: "b",
      moved: false,
      static: false,
    },
    {
      w: 3,
      h: 6,
      x: 0,
      y: 0,
      minW: 3,
      minH: 4,
      maxW: 12,
      maxH: 10,
      i: "c",
      moved: false,
      static: false,
    },
    {
      w: 6,
      h: 6,
      x: 0,
      y: 0,
      minW: 3,
      minH: 4,
      maxW: 12,
      maxH: 10,
      i: "d",
      moved: false,
      static: false,
    },
    {
      w: 2,
      h: 2,
      x: 0,
      y: 0,
      minW: 2,
      minH: 2,
      maxW: 4,
      maxH: 4,
      i: "e",
      moved: false,
      static: false,
    },
    {
      w: 2,
      h: 2,
      x: 0,
      y: 0,
      minW: 2,
      minH: 2,
      maxW: 4,
      maxH: 4,
      i: "f",
      moved: false,
      static: false,
    },
  ],
};

const componentList = {
  a: LineChart,
  b: AreaChart,
  c: BarChart,
  d: ScatterChart,
  e: OutlinedButton,
  f: ContainedButton,
};

const Content = ({
  deviceList,
  selectedDevice,
  handleUpdateLayout,
  layout,
  setLayout,
  handleChangeDevice,
  itemList,
}) => {
  console.log("items", layout);
  console.log("oitems", originalItems);
  const [items, setItems] = useState(itemList);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Przyjmuje nowy itemList z propsów i ustawia go w stanie lokalnym items
    setItems(itemList);
  }, [itemList]);

  const handleSelectionChange = (itemName, isSelected) => {
    if (isSelected) {
      setItems((prevItems) => [...prevItems, itemName]);
    } else {
      setItems((prevItems) => prevItems.filter((item) => item !== itemName));
    }
  };

  useEffect(() => {
    function handleResize() {
      setLayout((prevLayouts) => {
        // Add a check for prevLayouts.lg before using map on it
        if (prevLayouts && prevLayouts.lg) {
          return {
            ...prevLayouts,
            lg: prevLayouts.lg.map((item) => ({
              ...item,
              w: calculateWidth(window.innerWidth),
            })),
          };
        }
        return prevLayouts; // Return the previous layout as it is if lg is not defined
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onLayoutChange = (_, allLayouts) => {
    setLayout(allLayouts);
  };

  const onLayoutSave = () => {
    // setLayout(layout);
    saveToLS("layouts", layout);
    handleUpdateLayout();
  };

  const onRemoveItem = (itemId) => {
    setItems(items.filter((i) => i !== itemId));
  };

  const onAddItem = (itemId) => {
    // setItems([...items, itemId]);
  };

  const onLayoutEdit = () => {
    // setIsEditMode((prevEditMode) => !prevEditMode);
    console.log("edit", isEditMode);
  };

  const handleButtonClick = () => {
    console.log("handlebuttonclick");
    if (isEditMode) {
      onLayoutSave();
    } else {
      onLayoutEdit();
    }
    setIsEditMode((prevEditMode) => !prevEditMode);
  };

  return (
    <>
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
      <ResponsiveGridLayout
        className="layout"
        style={{border: "1px solid #ccc", borderRadius: "4px"}}
        layout={layout}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        width={window.innerWidth} // Use window.innerWidth here instead of size.width
        onLayoutChange={onLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        isBounded={true}
      >
        {items &&
          items.map((key) => {
            const layoutItemLg =
              layout && layout.lg
                ? layout.lg.find((item) => item.i === key)
                : null;
            const layoutItemMd =
              layout && layout.md
                ? layout.md.find((item) => item.i === key)
                : null;
            const defaultLayout = initialLayouts.lg.find(
              (item) => item.i === key
            ); // Find default layout item

            // Use layoutItemLg properties for lg breakpoint, or layoutItemMd properties for md breakpoint, or defaultLayout
            const gridData = layoutItemLg
              ? {
                  w: layoutItemLg.w,
                  h: layoutItemLg.h,
                  x: layoutItemLg.x,
                  y: layoutItemLg.y,
                  minW: layoutItemLg.minW,
                  minH: layoutItemLg.minH,
                  maxW: layoutItemLg.maxW,
                  maxH: layoutItemLg.maxH,
                }
              : layoutItemMd
              ? {
                  w: layoutItemMd.w,
                  h: layoutItemMd.h,
                  x: layoutItemMd.x,
                  y: layoutItemMd.y,
                  minW: layoutItemMd.minW,
                  minH: layoutItemMd.minH,
                  maxW: layoutItemMd.maxW,
                  maxH: layoutItemMd.maxH,
                }
              : defaultLayout
              ? {
                  w: defaultLayout.w,
                  h: defaultLayout.h,
                  x: defaultLayout.x,
                  y: defaultLayout.y,
                  minW: defaultLayout.minW,
                  minH: defaultLayout.minH,
                  maxW: defaultLayout.maxW,
                  maxH: defaultLayout.maxH,
                }
              : { w: 3, h: 2, x: 0, y: Infinity }; // If no defaultLayout found, use fallback values

            return (
              <div key={key} className="widget" data-grid={gridData}>
                <Widget
                  id={key}
                  onRemoveItem={onRemoveItem}
                  component={componentList[key]}
                  isEditMode={isEditMode}
                />
              </div>
            );
          })}
      </ResponsiveGridLayout>
    </>
  );
};

export default Content;

function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
    } catch (e) {}
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      "rgl-8",
      JSON.stringify({
        [key]: value,
      })
    );
  }
}

// Add your custom function to calculate the width based on your requirements
function calculateWidth(windowWidth) {
  if (windowWidth >= 1200) {
    return 6;
  } else if (windowWidth >= 768) {
    return 4;
  } else {
    return 2;
  }
}
